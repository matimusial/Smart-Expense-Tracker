import os
import shutil
import pytesseract
from PIL import Image
import cv2
from ultralytics import YOLO
import itertools

from services.image_ocr import load_image
from services.yolo_service.ocr import correct_ocr_text, get_tesseract_config, classify_payment_type_fuzzy
from services.yolo_service.ocr_processing import process_pil
from services.yolo_service.yolo import predict, get_best_detections
from services.receipt_trimmer import perform_trimming

from cnnTrimChecker.cnn_service.cnn_predict import load_cnn_model
from yoloTrainer.yolo_config import CLASS_NAMES
from cnnTrimChecker.cnn_config import SEQUENCE_1
from config import YOLO_PATH
from yoloTrainer.example_receipts_data import receipts_data


def compare_ocr_to_data(ocr_data, expected_data):
    comparisons = {}

    for i, field in enumerate(CLASS_NAMES):
        ocr_value = ocr_data.get(field, '').strip()
        expected_value = expected_data[i + 1].strip()

        if field == 'payment_type':
            ocr_value = ocr_value.upper()
            expected_value = expected_value.upper()

        elif field == 'sum':
            try:
                ocr_value = float(ocr_value.replace(',', '.'))
                expected_value = float(expected_value.replace(',', '.'))
            except ValueError:
                comparisons[field] = False
                continue
        result = ocr_value == expected_value
        comparisons[field] = result
    return comparisons


def process_image(image_path, class_name, config):
    try:
        image = load_image(image_path)
        custom_config = get_tesseract_config(class_name)
        processed_pil = process_pil(image, config)
        ocr_text = pytesseract.image_to_string(processed_pil, config=custom_config).strip()
        corrected_text = correct_ocr_text(ocr_text, class_name)
        if class_name == "payment_type":
            corrected_text = classify_payment_type_fuzzy(ocr_text)
        return corrected_text
    except Exception as e:
        print(f"Error processing image {image_path}: {e}")
        raise Exception("ERROR_PROCESS_IMAGE")


def process_entry(entry, base_path, config):

    folder_name, expected_date, expected_nip, expected_payment_type, expected_amount, expected_transaction_number = entry
    folder_path = os.path.join(base_path, folder_name)

    ocr_data = {}
    field_files = {
        'date': 'date.jpg',
        'nip': 'nip.jpg',
        'payment_type': 'payment_type.jpg',
        'sum': 'sum.jpg',
        'transaction_number': 'transaction_number.jpg'
    }

    for class_name, file_name in field_files.items():

        image_path = os.path.join(folder_path, file_name)
        if not os.path.exists(image_path):
            print(f"File does not exist: {image_path}")
            ocr_data[class_name] = ""
            raise Exception("File does not exist")
        ocr_text = process_image(image_path, class_name, config)
        ocr_data[class_name] = ocr_text

    if ocr_data:
        comparison = compare_ocr_to_data(ocr_data, entry)
        return comparison
    else:
        print(f"No OCR data for folder: {folder_name}")
        raise Exception("No OCR")


def extract_cropped_area(image, detection):
    if 'boxes' in detection:
        box = detection['box']
        x1, y1, x2, y2 = box.xyxy.tolist()[0]
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
    elif 'obb' in detection:
        obb = detection['obb']
        coords = obb.xyxyxyxy.tolist()[0] if hasattr(obb.xyxyxyxy, 'tolist') else list(obb.xyxyxyxy)
        points = [tuple(point) for point in coords]
        x_coords, y_coords = zip(*points)
        x1, y1 = max(int(min(x_coords)), 0), max(int(min(y_coords)), 0)
        x2, y2 = min(int(max(x_coords)), image.shape[1]), min(int(max(y_coords)), image.shape[0])
    else:
        raise Exception("No boxes detected")

    cropped_area = image[y1:y2, x1:x2]
    cropped_pil = Image.fromarray(cropped_area)

    return cropped_pil


def process_receipts_data(receipts_data, images_folder, output_root, trim_sequence, cnn_model, model):
    os.makedirs(output_root, exist_ok=True)

    for receipt in receipts_data:
        filename = receipt[0]
        image_path = os.path.join(images_folder, filename + ".jpg")

        if not os.path.isfile(image_path):
            print(f"File does not exist: {image_path}")
            raise Exception("Filename error")
        image = cv2.imread(image_path)

        if image is None:
            print(f"Cannot load image: {image_path}")
            raise Exception("Filename error")

        trimmed_image, flag = perform_trimming(image, trim_sequence["combination_list"], cnn_model)

        if not flag:
            raise Exception(f"Bad trimming for: {filename}")

        results = predict(model, trimmed_image)
        best_detections = get_best_detections(results)

        if not best_detections:
            print(f"No detections for image: {filename}")
            raise Exception("YOLO ERROR")

        image_name, _ = os.path.splitext(filename)
        image_output_folder = os.path.join(output_root, image_name)
        os.makedirs(image_output_folder, exist_ok=True)

        for class_idx, detection in best_detections.items():
            class_name = CLASS_NAMES[class_idx] if class_idx < len(CLASS_NAMES) else "unknown_class"
            cropped_area = extract_cropped_area(trimmed_image, detection)
            if cropped_area is not None:
                cropped_filename = f"{class_name}.jpg"
                cropped_path = os.path.join(image_output_folder, cropped_filename)
                cropped_area.save(cropped_path)


def test_configuration(config, receipts_data, images_dir):
    total_fields = 0
    correct_fields = 0
    field_correct_counts = {
        'date': 0,
        'nip': 0,
        'payment_type': 0,
        'sum': 0,
        'transaction_number': 0
    }

    comparisons = []
    for entry in receipts_data:
        comparison = process_entry(entry, images_dir, config)
        comparisons.append(comparison)

    for comparison in comparisons:
        if comparison:
            correct_fields += sum(comparison.values())
            total_fields += len(comparison)
            for field, is_correct in comparison.items():
                if is_correct:
                    field_correct_counts[field] += 1

    overall_accuracy = (correct_fields / total_fields) * 100 if total_fields else 0
    field_accuracies = {field: (count / len(receipts_data)) * 100 if len(receipts_data) else 0
                        for field, count in field_correct_counts.items()}

    return overall_accuracy, field_accuracies, config


def perform_ocr_tests(combinations, receipts_data, images_dir):
    results = []
    output_file = os.path.join("yoloTrainer", "ocr_processing_results.txt")

    print(f"Number of combinations to test: {len(combinations)}")
    for idx, config in enumerate(combinations, start=1):
        print(f"\n### TESTING CONFIGURATION {idx}/{len(combinations)} ###")

        try:
            overall_accuracy, field_accuracies, config_used = test_configuration(config, receipts_data, images_dir)
            print(f"Field accuracies: {field_accuracies}")

            results.append((overall_accuracy, field_accuracies, config_used))
            print(results)

            if overall_accuracy == 100.0:
                print(f"Achieved 100% accuracy for configuration: {config_used}.")
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f"Kombinacja osiągnęła 100% poprawności.\n")
                    f.write(f"Konfiguracja: {config_used}\n")
                return
        except Exception as e:
            print(f"Error with configuration {idx}: {e}")

    results.sort(key=lambda x: x[0], reverse=True)
    top_3 = results[:5]

    with open(output_file, "w", encoding="utf-8") as f:
        if any(r[0] == 100.0 for r in results):
            pass
        else:
            f.write("Top 5 kombinacji (bez osiągnięcia 100%):\n\n")
            for rank, (accuracy, field_acc, conf) in enumerate(top_3, start=1):
                f.write(f"{rank}. Konfiguracja:\n")
                f.write(f"   Dokładność: {accuracy:.2f}%\n")
                f.write(f"   Dokładności poszczególnych pól: {field_acc}\n")
                f.write(f"   Ustawienia: {conf}\n\n")

    print("OCR configuration testing completed.")


def main():
    images_folder = os.path.join('..', 'frontend', 'public', 'exampleReceipts')
    output_root = os.path.join("yoloTrainer", "ocr_test_images")

    if os.path.exists(output_root):
        try:
            shutil.rmtree(output_root)
        except Exception as e:
            print(f"Failed to remove folder {output_root}: {e}")
            return

    os.makedirs(output_root, exist_ok=True)
    trim_sequence = SEQUENCE_1
    try:
        cnn_model = load_cnn_model(trim_sequence["model_name"])
    except Exception as e:
        print(f"Error while loading the CNN model: {e}")
        return

    try:
        model = YOLO(YOLO_PATH)
    except Exception as e:
        print(f"Error while loading the YOLO model: {e}")
        return

    try:
        process_receipts_data(receipts_data, images_folder, output_root, trim_sequence, cnn_model, model)
        print("Receipt data processing completed.")
    except Exception as e:
        print(f"Error during receipt data processing: {e}")
        return

    try:
        del cnn_model
        del model
    except Exception as e:
        print(f"Error while releasing model memory: {e}")

    combinations = list(itertools.product(
        clean_background, clean_bg_function_ksize,
        clean_bg_gaussian_ksize, denoise,
        median_kernel, bilateral_params, enhance_contrast,
        clahe_params, gamma, adaptive_threshold,
        adaptive_block_size, adaptive_c, morphological_operation,
        close_kernel, erode_kernel, open_kernel,
        dilate_kernel))

    if len(combinations) > 2000:
        print(f'Too many combinations: {len(combinations)}')
        return

    config_keys = [
        'clean_background', 'clean_bg_function_ksize',
        'clean_bg_gaussian_ksize', 'denoise', 'median_kernel', 'bilateral_params', 'enhance_contrast',
        'clahe_params', 'gamma', 'adaptive_threshold',
        'adaptive_block_size', 'adaptive_c', 'morphological_operation',
        'close_kernel', 'erode_kernel', 'open_kernel',
        'dilate_kernel'
    ]

    combinations = [dict(zip(config_keys, comb)) for comb in combinations]

    try:
        perform_ocr_tests(combinations, receipts_data, output_root)
    except Exception as e:
        print(f"Error during OCR testing: {e}")
    finally:
        try:
            shutil.rmtree(output_root)
        except Exception as e:
            print(f"Failed to remove folder {output_root}: {e}")


if __name__ == "__main__":

    clean_background = [False, 'median', 'gaussian']  # Usuwanie tła: brak, medianowe, Gaussowskie.

    denoise = [False, 'median', 'bilateral']  # Odszumianie: brak, medianowe, bilateralne.

    enhance_contrast = [False, 'equalize', 'clahe']  # Kontrast: brak, equalize, CLAHE.

    gamma = [False, 1.2]  # Korekcja gamma: brak lub współczynnik.

    adaptive_threshold = [False, 'gaussian', 'otsu']  # Progowanie: brak, Gaussowskie, Otsu.

    morphological_operation = [False, 'closedilate', 'openclose',
                               'closeerode']  # Operacje: brak, zamknij/dylatacja, otwórz/zamknij, zamknij/erozja.

    clean_bg_function_ksize = [15]  # Rozmiar jądra dla medianowego usuwania tła.
    clean_bg_gaussian_ksize = [(21, 21)]  # Rozmiar jądra dla Gaussowskiego usuwania tła.

    median_kernel = [3]  # Rozmiar jądra dla medianowego filtrowania.
    bilateral_params = [(9, 75, 75)]  # Parametry bilateralne: średnica, sigmaColor, sigmaSpace.

    clahe_params = [(2.0, (8, 8))]  # Parametry CLAHE: limit kontrastu, rozmiar siatki.

    adaptive_block_size = [15]  # Rozmiar bloku dla progowania adaptacyjnego.
    adaptive_c = [3]  # Stała odejmowana od średniej przy progowaniu.

    close_kernel = [(5, 5)]  # Rozmiar jądra dla operacji zamknięcia.
    erode_kernel = [(2, 2)]  # Rozmiar jądra dla operacji erozji.
    open_kernel = [(2, 2)]  # Rozmiar jądra dla operacji otwarcia.
    dilate_kernel = [(3, 3)]  # Rozmiar jądra dla operacji dylatacji.

    main()
