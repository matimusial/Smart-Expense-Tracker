import os
import shutil
import pytesseract
from PIL import Image
import cv2
from ultralytics import YOLO
import itertools
import concurrent.futures
import multiprocessing
import gc

from services.image_ocr import load_image
from services.yolo_service.ocr import correct_ocr_text, get_tesseract_config, classify_payment_type_fuzzy
from services.yolo_service.ocr_processing import process_pil
from services.yolo_service.yolo import predict, get_best_detections
from services.receipt_trimmer import perform_trimming

from cnnTrimChecker.cnn_service.cnn_predict import load_cnn_model
from yoloTrainer.yolo_config import CLASS_NAMES
from cnnTrimChecker.cnn_config import SEQUENCE_1
from config import YOLO_PATH
from tests_files.example_receipts_data import receipts_data


def compare_ocr_to_data(ocr_data, expected_data):
    comparisons = {}

    ocr_date = ocr_data.get('date', '').strip()
    expected_date = expected_data[1]
    comparisons['date'] = (ocr_date == expected_date)

    ocr_nip = ocr_data.get('nip', '').strip()
    expected_nip = expected_data[2]
    comparisons['nip'] = (ocr_nip == expected_nip)

    ocr_payment_type = ocr_data.get('payment_type', '').strip().upper()
    expected_payment_type = expected_data[3].upper()
    comparisons['payment_type'] = (ocr_payment_type == expected_payment_type)

    try:
        ocr_amount = float(ocr_data.get('sum', '').replace(',', '.').strip())
        expected_amount = float(expected_data[4].replace(',', '.').strip())
        comparisons['sum'] = (abs(ocr_amount - expected_amount) < 0.01)
    except ValueError:
        comparisons['sum'] = False

    ocr_transaction_number = ocr_data.get('transaction_number', '').strip()
    expected_transaction_number = expected_data[5]
    comparisons['transaction_number'] = (ocr_transaction_number == expected_transaction_number)

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
            print(f"Plik nie istnieje: {image_path}")
            ocr_data[class_name] = ""
            raise Exception("Plik nie istnieje")
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
            print(f"Plik nie istnieje: {image_path}")
            raise Exception("Filename error")
        image = cv2.imread(image_path)

        if image is None:
            print(f"Nie można wczytać obrazu: {image_path}")
            raise Exception("Filename error")

        trimmed_image, flag = perform_trimming(image, trim_sequence["combination_list"], cnn_model)

        if not flag:
            raise Exception(f"Bad trimming for :{filename}")

        results = predict(model, trimmed_image)
        best_detections = get_best_detections(results)

        if not best_detections:
            print(f"Brak wykryć dla obrazu: {filename}")
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
    correct_records = 0
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
            if all(comparison.values()):
                correct_records += 1
            for field, is_correct in comparison.items():
                if is_correct:
                    field_correct_counts[field] += 1

    total_records = len(receipts_data)
    overall_accuracy = (correct_records / total_records) * 100 if total_records else 0
    field_accuracies = {field: (count / total_records) * 100 if total_records else 0 for field, count in
                        field_correct_counts.items()}

    return (overall_accuracy, field_accuracies, config)


def perform_ocr_tests(combinations, receipts_data, images_dir):
    results = []
    output_file = "ranking_wynikow.txt"

    # Use all available CPU cores
    max_workers = multiprocessing.cpu_count()

    with concurrent.futures.ProcessPoolExecutor(max_workers=max_workers) as executor:
        # Submit all configurations to the executor
        future_to_config = {executor.submit(test_configuration, config, receipts_data, images_dir): config for config in combinations}

        for future in concurrent.futures.as_completed(future_to_config):
            config = future_to_config[future]
            try:
                overall_accuracy, field_accuracies, config_used = future.result()
                results.append((overall_accuracy, field_accuracies, config_used))
                print(f"Konfiguracja przetworzona: {config_used} - Dokładność: {overall_accuracy:.2f}%")

                if overall_accuracy == 100.0:
                    print(f"Osiągnięto 100% poprawności dla konfiguracji: {config_used}.")
                    # Zapisz wynik i zakończ dalsze przetwarzanie
                    with open(output_file, "w", encoding="utf-8") as f:
                        f.write(f"Kombinacja osiągnęła 100% poprawności.\n")
                        f.write(f"Konfiguracja: {config_used}\n")
                    # Shutdown executor immediately
                    executor.shutdown(wait=False, cancel_futures=True)
                    return
            except Exception as e:
                print(f"Błąd podczas przetwarzania konfiguracji {config}: {e}")

    # Po przetworzeniu wszystkich konfiguracji, posortuj wyniki
    results.sort(key=lambda x: x[0], reverse=True)
    top_3 = results[:3]

    with open(output_file, "w", encoding="utf-8") as f:
        if any(r[0] == 100.0 for r in results):
            pass
        else:
            f.write("Top 3 kombinacje (bez osiągnięcia 100%):\n\n")
            for rank, (accuracy, field_acc, conf) in enumerate(top_3, start=1):
                f.write(f"{rank}. Konfiguracja:\n")
                f.write(f"   Dokładność: {accuracy:.2f}%\n")
                f.write(f"   Dokładności poszczególnych pól: {field_acc}\n")
                f.write(f"   Ustawienia: {conf}\n\n")

    print("Zakończono testowanie konfiguracji OCR.")


def main():
    images_folder = r'C:\Users\matim\Desktop\Smart-Expense-Tracker\frontend\public\exampleReceipts'
    output_root = "ocr_test_images"

    if os.path.exists(output_root):
        try:
            shutil.rmtree(output_root)
            print(f"Usunięto istniejący folder: {output_root}")
        except Exception as e:
            print(f"Nie udało się usunąć folderu {output_root}: {e}")
            return

    # Krok 2: Stwórz nowy folder ocr_test_images
    os.makedirs(output_root, exist_ok=True)
    print(f"Utworzono nowy folder: {output_root}")

    # Inicjalizacja modeli
    trim_sequence = SEQUENCE_1
    try:
        cnn_model = load_cnn_model(trim_sequence["model_name"])
        print("Załadowano model CNN.")
    except Exception as e:
        print(f"Błąd podczas ładowania modelu CNN: {e}")
        return

    try:
        model = YOLO(YOLO_PATH)
        print("Załadowano model YOLO.")
    except Exception as e:
        print(f"Błąd podczas ładowania modelu YOLO: {e}")
        return

    # Krok 3: Przetwórz dane paragonów
    try:
        process_receipts_data(receipts_data, images_folder, output_root, trim_sequence, cnn_model, model)
        print("Przetwarzanie danych paragonów zakończone.")
    except Exception as e:
        print(f"Błąd podczas przetwarzania danych paragonów: {e}")
        return

    # *** Zwolnienie pamięci zajmowanej przez modele ***
    try:
        del cnn_model
        del model
        gc.collect()
        print("Zwolniono pamięć zajmowaną przez modele CNN i YOLO.")
    except Exception as e:
        print(f"Błąd podczas zwalniania pamięci modeli: {e}")

    # Krok 4: Przygotuj kombinacje konfiguracji OCR
    clean_background = [False, 'function', 'gaussian']
    clean_bg_function_ksize = [15, 21]
    clean_bg_gaussian_ksize = [(21, 21)]
    denoise = [False, 'median', 'bilateral']
    median_kernel = [3, 5]
    bilateral_params = [(9, 75, 75)]
    enhance_contrast = [False, 'equalize', 'clahe']
    clahe_params = [(2.0, (8, 8)), (3.0, (8, 8))]
    gamma = [False, 1.0, 1.2]
    adaptive_threshold = [False, 'gaussian', 'otsu']
    adaptive_block_size = [11, 15]
    adaptive_c = [2, 3]
    morphological_operation = [False, 'closedilate', 'openclose', 'closeerode']
    close_kernel = [(2, 2), (5, 5)]
    erode_kernel = [(2, 2), (5, 5)]
    open_kernel = [(2, 2), (5, 5)]
    dilate_kernel = [(3, 3), (5, 5)]

    clean_bg_function_ksize = [21]  # 21 jako optymalny dla usuwania nierównego tła
    clean_bg_gaussian_ksize = [(21, 21)]
    median_kernel = [5]  # Kernel 5 daje optymalne wyniki przy zachowaniu szczegółów liter
    clahe_params = [(2.0, (8, 8))]  # CLAHE z 2.0 jako standardowy parametr
    gamma = [False, 1.2]  # Gamma 1.2 rozjaśnia tekst, zachowując kontrast
    adaptive_block_size = [15]  # Blok 15 skutecznie segmentuje małe fragmenty tekstu
    adaptive_c = [2]  # Delikatna korekta progu binarnego
    close_kernel = [(3, 3), (5, 5)]  # Małe jądra, aby delikatnie łączyć fragmenty
    dilate_kernel = [(3, 3)]  # Wzmocnienie krawędzi liter

    combinations = list(itertools.product(
        clean_background, clean_bg_function_ksize,
        clean_bg_gaussian_ksize, denoise,
        median_kernel, bilateral_params, enhance_contrast,
        clahe_params, gamma, adaptive_threshold,
        adaptive_block_size, adaptive_c, morphological_operation,
        close_kernel, erode_kernel, open_kernel,
        dilate_kernel))

    config_keys = [
        'clean_background', 'clean_bg_function_ksize',
        'clean_bg_gaussian_ksize', 'denoise', 'median_kernel', 'bilateral_params', 'enhance_contrast',
        'clahe_params', 'gamma', 'adaptive_threshold',
        'adaptive_block_size', 'adaptive_c', 'morphological_operation',
        'close_kernel', 'erode_kernel', 'open_kernel',
        'dilate_kernel'
    ]

    combinations = [dict(zip(config_keys, comb)) for comb in combinations]
    print(f"Liczba kombinacji do przetestowania: {len(combinations)}")

    # Krok 5: Testuj konfiguracje OCR równolegle
    try:
        perform_ocr_tests(combinations, receipts_data, output_root)
    except Exception as e:
        print(f"Błąd podczas testowania OCR: {e}")
    finally:
        # Krok 6: Usuń folder ocr_test_images po zakończeniu
        try:
            shutil.rmtree(output_root)
            print(f"Usunięto folder po przetwarzaniu: {output_root}")
        except Exception as e:
            print(f"Nie udało się usunąć folderu {output_root}: {e}")


if __name__ == "__main__":
    main()
