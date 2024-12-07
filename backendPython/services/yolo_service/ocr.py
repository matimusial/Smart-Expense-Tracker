import re
from enum import Enum
import pytesseract
from PIL import Image

from rapidfuzz import process, fuzz
from yoloTrainer.yolo_config import CLASS_NAMES, FUZZY_THRESHOLD

class PaymentType(Enum):
    CARD = "CARD"
    CASH = "CASH"
    BLIK = "BLIK"
    OTHER = "OTHER"

PAYMENT_TYPE_VARIANTS = {
    PaymentType.CARD.value: [
        "karta",
        "karsa",
        "mastercard",
        "masterkard",
        "visa debit",
        "debit",
        "maestro",
        "karta płatnicza",
        "kartta",
        "mastrcard",
        "mstrcard",
        "visa debet",
        "visa debit card",
        "master card",
        "maestro card",
        "debit card",
        "kwewka",
        "KARJAKR",
        "JAKRHAIE",
        "PLATNSJWLA",
        "karta karta parkalrna",
        "KARTA Kart katnicza"
    ],
    PaymentType.CASH.value: [
        "gotowka",
        "gosowka",
        "gotówka",
        "got0wka",
        "gotowk",
        "gosówka",
        "gotk0wa",
        "gotowk0a",
        "gosowka",
        "gotowka",
        "gotowka płatność",
        "gotowkowy"
    ],
    PaymentType.BLIK.value: [
        "inna blik",
        "blk",
        "blik",
        "bliik",
        "blk",
        "bk",
        "blik płatność",
        "blik",
        "inna bekal",
        "inNa blik"
    ]
}

def classify_payment_type_fuzzy(text):
    text = text.lower()

    best_match = PaymentType.OTHER.value
    highest_score = 0

    for payment_type, variants in PAYMENT_TYPE_VARIANTS.items():
        result = process.extractOne(text, variants, scorer=fuzz.WRatio)
        if result:
            match, score, _ = result
            if score > highest_score and score >= FUZZY_THRESHOLD:
                best_match = payment_type
                highest_score = score

    return best_match

def extract_ocr_text(image, detection, class_name):
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
        print("Nieznany typ detekcji.")
        return ""

    cropped_area = image[y1:y2, x1:x2]
    if cropped_area.size == 0:
        print(f"Ostrzeżenie: Wycięty obszar jest pusty.")
        return ""

    cropped_pil = Image.fromarray(cropped_area)

    # Dostosowanie konfiguracji Tesseract w zależności od klasy
    custom_config = get_tesseract_config(class_name)

    ocr_text = pytesseract.image_to_string(cropped_pil, config=custom_config).strip()

    # Korekcja OCR na podstawie typu klasy
    corrected_text = correct_ocr_text(ocr_text, class_name)

    return corrected_text

def get_tesseract_config(class_name):
    if class_name == "date":
        # Tylko cyfry i myślniki
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789-'
    elif class_name == "nip":
        # Tylko cyfry i myślniki
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789-'
    elif class_name == "payment_type":
        # Tylko litery i spacje
        config = r'--oem 1 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyząćęłńóśźżĄĆĘŁŃÓŚŹŻ '
    elif class_name == "sum":
        # Tylko cyfry, przecinki i kropki
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789.,'
    elif class_name == "transaction_number":
        # Tylko cyfry
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789'
    return config

def correct_ocr_text(text, class_name):
    if class_name == "date":
        # Próbuj dopasować format rrrr-mm-dd
        match = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', text)
        if match:
            year, month, day = match.groups()
            # Upewnij się, że miesiąc i dzień mają dwa cyfry
            month = month.zfill(2)
            day = day.zfill(2)
            return f"{year}-{month}-{day}"
        else:
            # Jeśli nie pasuje, zwróć oryginalny tekst lub inną domyślną wartość
            return text
    elif class_name == "nip":
        # Usuń wszystkie niecyfrowe znaki
        cleaned = re.sub(r'\D', '', text)
        return cleaned
    elif class_name == "sum":
        # Zamień przecinki na kropki i upewnij się, że jest tylko jedna kropka
        cleaned = text.replace(',', '.')
        parts = cleaned.split('.')
        if len(parts) > 2:
            # Jeśli więcej niż jedna kropka, zachowaj tylko pierwszą
            cleaned = parts[0] + '.' + ''.join(parts[1:])
        try:
            # Sformatuj jako float z dwoma miejscami po przecinku
            amount = float(cleaned)
            return f"{amount:.2f}"
        except ValueError:
            # Jeśli nie udało się przekonwertować, zwróć oryginalny tekst
            return text
    elif class_name == "transaction_number":
        # Usuń wszystkie niecyfrowe znaki
        cleaned = re.sub(r'\D', '', text)
        return cleaned
    elif class_name == "payment_type":
        # Można dodać dodatkowe korekty, jeśli potrzebne
        return text.lower().strip()
    else:
        return text

def perform_ocr_on_detections(image, detections):
    ocr_results = {class_name: "" for class_name in CLASS_NAMES}

    for class_id, detection in detections.items():
        class_name = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else "unknown_class"

        ocr_text = extract_ocr_text(image, detection, class_name)

        if class_name == "payment_type":
            predicted_payment_type = classify_payment_type_fuzzy(ocr_text)
            ocr_results[class_name] = predicted_payment_type
        else:
            ocr_results[class_name] = ocr_text

    return ocr_results
