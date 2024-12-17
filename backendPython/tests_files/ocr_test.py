import os
from services.image_ocr import load_model
from tests_files.example_receipts_data import receipts_data
import itertools


def compare_ocr_to_data(ocr_data, expected_data):
    comparisons = {}
    comparison_details = {}

    ocr_date = ocr_data.get('date', '').strip()
    expected_date = expected_data[1]
    comparisons['date'] = ocr_date == expected_date
    comparison_details['date'] = {'found': ocr_date, 'expected': expected_date}

    ocr_nip = ocr_data.get('nip', '').strip()
    expected_nip = expected_data[2]
    comparisons['nip'] = ocr_nip == expected_nip
    comparison_details['nip'] = {'found': ocr_nip, 'expected': expected_nip}

    ocr_payment_type = ocr_data.get('payment_type', '').strip().upper()
    expected_payment_type = expected_data[3].upper()
    comparisons['payment_type'] = ocr_payment_type == expected_payment_type
    comparison_details['payment_type'] = {'found': ocr_payment_type, 'expected': expected_payment_type}

    try:
        ocr_amount = float(ocr_data.get('sum', '').replace(',', '.').strip())
        expected_amount = float(expected_data[4].replace(',', '.').strip())
        comparisons['sum'] = abs(ocr_amount - expected_amount) < 0.01
        comparison_details['sum'] = {'found': ocr_amount, 'expected': expected_amount}
    except ValueError:
        comparisons['sum'] = False
        comparison_details['sum'] = {'found': ocr_data.get('sum', '').strip(), 'expected': expected_data[4]}

    ocr_transaction_number = ocr_data.get('transaction_number', '').strip()
    expected_transaction_number = expected_data[5]
    comparisons['transaction_number'] = ocr_transaction_number == expected_transaction_number
    comparison_details['transaction_number'] = {'found': ocr_transaction_number,
                                                'expected': expected_transaction_number}

    return comparisons


def process_entry(entry, IMAGES_DIR, model):
    from services.image_ocr import predict_image, load_image

    image_filename, expected_date, expected_nip, expected_payment_type, expected_amount, expected_transaction_number = entry
    image_path = os.path.join(IMAGES_DIR, image_filename)

    try:
        image = load_image(image_path)
        ocr_data, yolo_image = predict_image(image, model)

        if ocr_data:
            comparison = compare_ocr_to_data(ocr_data, entry)
            return comparison
        else:
            print(f"Brak detekcji OCR dla obrazu: {image_filename}")
            return {}
    except Exception as e:
        print(f"Wystąpił błąd podczas przetwarzania {image_filename}: {e}")
        return {}


if __name__ == "__main__":
    MODEL_PATH = r"C:\Users\matim\Desktop\Smart-Expense-Tracker\backendPython\yoloTrainer\yolo_training_runs\run_6_200_16_0.0015_yolov8m-obb.pt\weights\best.pt"
    IMAGES_DIR = r"C:\Users\matim\Desktop\exampleReceipts\Nowy folder"

    model = load_model(MODEL_PATH)

    clean_background = [False, 'function', 'gaussian']
    clean_bg_function_ksize = [15, 21]
    clean_bg_gaussian_ksize = [(21,21)]
    denoise = [False, 'median', 'bilateral']
    median_kernel = [3, 5]
    bilateral_params = [(9,75,75)]
    enhance_contrast = [False, 'equalize', 'clahe']
    clahe_params = [(2.0,(8,8)), (3.0,(8,8))]
    gamma = [False, 1.0, 1.2]
    adaptive_threshold = [False, 'gaussian', 'otsu']
    adaptive_block_size = [11, 15]
    adaptive_c = [2, 3]
    morphological_operation = [False, 'closedilate', 'openclose', 'closeerode']
    close_kernel = [(2, 2), (5, 5)]
    erode_kernel = [(2, 2), (5, 5)]
    open_kernel = [(2, 2), (5, 5)]
    dilate_kernel = [(3, 3), (5, 5)]

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

    results = []
    output_file = "ranking_wynikow.txt"

    for idx, config in enumerate(combinations, start=1):
        print(f"\n=== Testowanie konfiguracji #{idx}/{len(combinations)} ===")

        total_records = len(receipts_data)
        correct_records = 0
        field_correct_counts = {
            'date': 0,
            'nip': 0,
            'payment_type': 0,
            'sum': 0,
            'transaction_number': 0
        }

        import yoloTrainer.yolo_config as yoloconfig
        for k, v in config.items():
            yoloconfig.OCR_PROCESSING_CONFIGURATION[k] = v

        comparisons = []
        for entry in receipts_data:
            comparison = process_entry(entry, IMAGES_DIR, model)
            comparisons.append(comparison)

        for comparison in comparisons:
            if comparison:
                if all(comparison.values()):
                    correct_records += 1
                for field, is_correct in comparison.items():
                    if is_correct:
                        field_correct_counts[field] += 1

        overall_accuracy = (correct_records / total_records) * 100 if total_records else 0
        field_accuracies = {field: (count / total_records) * 100 if total_records else 0 for field, count in
                            field_correct_counts.items()}
        results.append((overall_accuracy, field_accuracies, idx, config))

        if overall_accuracy == 100.0:
            print(f"Osiągnięto 100% poprawności dla konfiguracji #{idx}. Zatrzymywanie programu.")
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(f"Kombinacja #{idx} osiągnęła 100% poprawności.\n")
                f.write(f"Konfiguracja: {config}\n")
            break
    else:
        results.sort(key=lambda x: x[0], reverse=True)
        top_3 = results[:3]

        with open(output_file, "w", encoding="utf-8") as f:
            f.write("Top 3 kombinacje (bez osiągnięcia 100%):\n\n")
            for rank, (accuracy, field_acc, config_idx, conf) in enumerate(top_3, start=1):
                f.write(f"{rank}. Konfiguracja #{config_idx}\n")
                f.write(f"   Dokładność: {accuracy:.2f}%\n")
                f.write(f"   Dokładności poszczególnych pól: {field_acc}\n")
                f.write(f"   Ustawienia: {conf}\n\n")

    print("Zakończono przetwarzanie.")
