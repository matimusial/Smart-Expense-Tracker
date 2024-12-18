import re
from datetime import datetime
from enum import Enum
import pytesseract
from PIL import Image

from rapidfuzz import process, fuzz

from services.yolo_service.ocr_processing import process_pil
from yoloTrainer.yolo_config import CLASS_NAMES, FUZZY_THRESHOLD


class PaymentType(Enum):
    CARD = "KARTA"
    CASH = "GOTÓWKA"
    BLIK = "BLIK"
    OTHER = "INNE"


PAYMENT_TYPE_VARIANTS = {
    PaymentType.CARD.value: [
        "karta",
        "karsa",
        "mastercard",
        "masterkard",
        "visadebit",
        "debit",
        "maestro",
        "kartapłatnicza",
        "kartta",
        "mastrcard",
        "mstrcard",
        "visadebet",
        "visadebitcard",
        "mastercard",
        "maestrocard",
        "debitcard",
        "kwewka",
        "karjkak",
        "karkkarta",
        "plantsjan",
        "kartakarta parkalrna",
        "kartaKartkatnicza",
        "artayisadebit",
        "kartakartaplatnicza",
        "kartovisadebit",
        "kartakartaptatnicza",
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
        "gotowkapłatność",
        "gotowkowy",
        "gotouka",
        "gotouka"
    ],
    PaymentType.BLIK.value: [
        "innablik",
        "blk",
        "blik",
        "bliik",
        "blk",
        "bk",
        "blikpłatność",
        "blik",
        "innabekal",
        "inNablik",
        "inneblik",
    ]
}


def classify_payment_type_fuzzy(text):
    text = text.lower()
    text = text.replace(" ", "")

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
        print("Unknown detection type.")
        print(detection)
        return ""

    cropped_area = image[y1:y2, x1:x2]
    if cropped_area.size == 0:
        print("Warning: The cropped area is empty.")
        return ""

    cropped_pil = Image.fromarray(cropped_area)
    custom_config = get_tesseract_config(class_name)
    processed_pil = process_pil(cropped_pil)
    ocr_text = pytesseract.image_to_string(processed_pil, config=custom_config).strip()
    corrected_text = correct_ocr_text(ocr_text, class_name)
    return corrected_text


def get_tesseract_config(class_name):
    if class_name == "date":
        # Only digits and hyphens
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789-'
    elif class_name == "nip":
        # Only digits and hyphens
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789-'
    elif class_name == "payment_type":
        # Only letters and spaces
        config = (r'--oem 1 --psm 7 -c '
                  r'tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyząćęłńóśźżĄĆĘŁŃÓŚŹŻ ')
    elif class_name == "sum":
        # Only digits, commas and dots
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789.,'
    elif class_name == "transaction_number":
        # Only digits
        config = r'--oem 1 --psm 8 -c tessedit_char_whitelist=0123456789'
    return config


def correct_ocr_text(text, class_name):
    text = text.strip()

    if class_name == "date":
        match = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', text)
        if match:
            year, month, day = match.groups()
            try:
                y = int(year)
                m = int(month)
                d = int(day)
                if not (1 <= m <= 12) or not (1 <= d <= 31):
                    raise ValueError("Invalid month or day range")

                parsed_date = datetime(y, m, d)
                today = datetime.today()

                if parsed_date > today:
                    return today.strftime('%Y-%m-%d')
                else:
                    return f"{y:04d}-{m:02d}-{d:02d}"
            except ValueError:
                return datetime.today().strftime('%Y-%m-%d')
        else:
            return datetime.today().strftime('%Y-%m-%d')

    elif class_name == "nip":
        cleaned = re.sub(r'\D', '', text)
        if len(cleaned) < 10:
            cleaned = cleaned.zfill(10)
        elif len(cleaned) > 10:
            cleaned = cleaned[:10]
        return cleaned

    elif class_name == "sum":
        cleaned = text.replace(',', '.')
        cleaned = re.sub(r'[^0-9\.]', '', cleaned)
        if cleaned.count('.') > 1:
            parts = cleaned.split('.')
            cleaned = parts[0] + '.' + ''.join(parts[1:])

        try:
            amount = float(cleaned)
            formatted = f"{amount:.2f}"

            integer_part, decimal_part = formatted.split('.')
            if len(integer_part) > 8:
                integer_part = integer_part[-8:]

            return f"{integer_part}.{decimal_part}"
        except ValueError:
            return "00.00"

    elif class_name == "transaction_number":
        cleaned = re.sub(r'\D', '', text)
        if len(cleaned) < 6:
            cleaned = cleaned.zfill(6)
        elif len(cleaned) > 6:
            cleaned = cleaned[:6]
        return cleaned

    elif class_name == "payment_type":
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
