from ultralytics import YOLO
import math
import cv2
import os
import pytesseract
from PIL import Image
import numpy as np

# === Konfiguracja ===

# Ścieżka do modelu YOLO
model_path = r"C:\Users\matim\Desktop\Smart-Expense-Tracker\backendPython\yoloTrainer\runs\obb\yolov8_obb_train\weights\best.pt"

# Ścieżka do obrazu, na którym wykonujemy predykcję
image_path = r"C:\Users\matim\Desktop\Smart-Expense-Tracker\backendPython\yoloTrainer\yolo_data\images\20241030_001633.jpg"

# Ścieżka do zapisu obrazu z zaznaczonymi obiektami
output_image_path = r"C:\Users\matim\Desktop\Smart-Expense-Tracker\backendPython\yoloTrainer\yolo_data\images\annotated_image.jpg"

# Lista nazw klas (dostosuj do swoich klas)
class_names = ["date", "nip", "payment_type", "sum", "transaction_number"]

# === Ustawienia ===

# Scale Factor do skalowania OBB (1.0 = brak skalowania)
scale_factor = 1.0  # Zdefiniuj tutaj wartość skalowania

# Katalog na wycięte obiekty
output_dir = 'cropped_objects'  # Zdefiniuj tutaj katalog wyjściowy

# === Załaduj model YOLO ===
model = YOLO(model_path)

# === Wykonaj predykcję ===
results = model.predict(
    source=image_path,
    conf=0.25,  # Możesz obniżyć do 0.1, jeśli brak detekcji
    save=False,  # Wyłącz zapis wyników przez model
    show=False  # Wyłącz wyświetlanie wyników przez model
)

# === Przygotowanie katalogu na wycięte obiekty ===
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# === Załaduj obraz za pomocą OpenCV ===
# OpenCV wczytuje obrazy w formacie BGR
image_bgr = cv2.imread(image_path)
if image_bgr is None:
    raise FileNotFoundError(f"Nie można załadować obrazu ze ścieżki: {image_path}")

# Inicjalizacja obrazu do rysowania
annotated_image = image_bgr.copy()

# === Słownik do przechowywania najlepszych detekcji dla każdej klasy ===
best_detections = {}

for idx, result in enumerate(results):

    # Sprawdź, czy 'obb' istnieje i nie jest None
    if hasattr(result, 'obb') and result.obb is not None:
        obbs = result.obb  # Lista obiektów OBB

        # Sprawdź, czy obbs zawiera detekcje
        if len(obbs) > 0:
            for obb in obbs:
                # Wyciągnij identyfikator klasy i poziom pewności
                class_id = int(obb.cls.item()) if obb.cls is not None else None
                confidence = obb.conf.item() if obb.conf is not None else 0.0

                if class_id is None:
                    continue  # Pomijamy detekcje bez klasy

                # Sprawdź, czy ta klasa już istnieje w słowniku
                if class_id not in best_detections or confidence > best_detections[class_id]['conf']:
                    best_detections[class_id] = {
                        'obb': obb,
                        'conf': confidence
                    }
        else:
            print("  Brak detekcji obiektów powyżej progu pewności w 'obb'.")
    else:
        print("  'obb' jest None lub brak detekcji obiektów.")

# === Przygotowanie Słownika Wyników ===
ocr_results = {
    "date": "",
    "nip": "",
    "payment_type": "",
    "sum": "",
    "transaction_number": ""
}

# === Rysowanie najlepszych detekcji na obrazie oraz wycinanie obiektów ===
for class_id, detection in best_detections.items():
    obb = detection['obb']
    confidence = detection['conf']

    # Wyciągnij współrzędne czterech punktów OBB
    xyxyxyxy = obb.xyxyxyxy  # Tensor z czterema punktami
    if hasattr(xyxyxyxy, 'tolist'):
        coords = xyxyxyxy.tolist()[0]  # Konwersja do listy
    else:
        coords = list(xyxyxyxy)

    # Rozdziel współrzędne na pary (x, y)
    points = [tuple(point) for point in coords]

    # Wyciągnij parametry rotowanego prostokąta
    xywhr = obb.xywhr.tolist()[0]  # [x_center, y_center, width, height, rotation]
    x_center, y_center, width, height, rotation_rad = xywhr
    rotation_deg = math.degrees(rotation_rad)

    # Zamień identyfikator klasy na nazwę
    if class_id < len(class_names):
        class_name = class_names[class_id]
    else:
        class_name = "unknown_class"

    # === Skalowanie Punktów OBB ===
    if scale_factor != 1.0:
        scaled_points = []
        for (x, y) in points:
            x_new = x_center + (x - x_center) * scale_factor
            y_new = y_center + (y - y_center) * scale_factor
            scaled_points.append((int(x_new), int(y_new)))
    else:
        scaled_points = [(int(x), int(y)) for (x, y) in points]  # Brak skalowania

    # === Rysowanie Poligonu na obrazie ===
    # Konwersja listy punktów do formatu numpy array
    pts = np.array(scaled_points, np.int32)
    pts = pts.reshape((-1, 1, 2))
    cv2.polylines(annotated_image, [pts], isClosed=True, color=(0, 0, 255), thickness=2)

    # === Wycinanie Obszaru OBB z obrazu ===
    # Oblicz minimalny prostokąt obejmujący OBB
    x_coords, y_coords = zip(*scaled_points)
    min_x, max_x = min(x_coords), max(x_coords)
    min_y, max_y = min(y_coords), max(y_coords)

    # Dostosuj minimalne i maksymalne wartości do rozmiaru obrazu
    min_x = max(int(min_x), 0)
    min_y = max(int(min_y), 0)
    max_x = min(int(max_x), image_bgr.shape[1])
    max_y = min(int(max_y), image_bgr.shape[0])

    # Wytnij obszar z oryginalnego obrazu (OpenCV używa BGR)
    cropped_bgr = image_bgr[min_y:max_y, min_x:max_x]

    # Sprawdź, czy wycięty obszar nie jest pusty
    if cropped_bgr.size == 0:
        print(f"    Ostrzeżenie: Wycięty obszar dla klasy {class_name} jest pusty.")
        continue

    # Konwersja wyciętego obrazu do RGB dla OCR
    cropped_rgb = cv2.cvtColor(cropped_bgr, cv2.COLOR_BGR2RGB)

    # Przekształcenie do formatu PIL
    cropped_pil = Image.fromarray(cropped_rgb)

    # Konfiguracja Tesseract
    custom_config = r'--oem 1 --psm 8'  # Ustawienia Tesseract

    # Wykonaj OCR na wyciętym obrazie
    ocr_text = pytesseract.image_to_string(cropped_pil, config=custom_config).strip()

    # Przypisz wynik do odpowiedniego klucza w słowniku
    if class_name in ocr_results:
        ocr_results[class_name] = ocr_text
    else:
        ocr_results[class_name] = ocr_text  # Możesz dodać logikę dla nieznanych klas

    # Zapisz wycięty obiekt jako plik obrazu
    cropped_image_path = os.path.join(output_dir, f"{class_name}_id{class_id}_conf{confidence:.2f}.png")
    cropped_pil.save(cropped_image_path)

# === Wyświetlenie Słownika Wyników ===
print("\n=== Wyniki OCR ===")
for key, value in ocr_results.items():
    print(f"{key}: {value}")
