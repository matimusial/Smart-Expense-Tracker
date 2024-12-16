import pytest
import re
from freezegun import freeze_time
from services.yolo_service.ocr import correct_ocr_text


# Dodatkowe testy dla "date"
# OCR dla date: cyfry i '-'
@pytest.mark.parametrize("input_text,expected_pattern", [
    ("2024-1-9", r"^\d{4}-\d{2}-\d{2}$"),     # brak zer wiodących, spodziewamy się uzupełnienia
    ("2024-05-3", r"^\d{4}-\d{2}-\d{2}$"),    # tylko jedna cyfra w dniu
    ("0000-00-00", r"^\d{4}-\d{2}-\d{2}$"),   # niepoprawna data, powinna zwrócić dzisiejszą
    ("2024-13-05", r"^\d{4}-\d{2}-\d{2}$"),   # miesiąc poza zakresem, dziś
    ("2024-05-32", r"^\d{4}-\d{2}-\d{2}$"),   # dzień poza zakresem, dziś
    ("2024--05", r"^\d{4}-\d{2}-\d{2}$"),     # niepełna data, dziś
    ("2024-05", r"^\d{4}-\d{2}-\d{2}$"),      # brak dnia, dziś
])
@freeze_time("2024-12-16")
def test_correct_ocr_text_date_additional(input_text, expected_pattern):
    result = correct_ocr_text(input_text, "date")
    assert re.match(expected_pattern, result), f"Result {result} does not match pattern {expected_pattern}"
    # Niektóre przypadki są niepoprawne - powinny zwrócić dzisiejszą datę:
    if input_text in ["0000-00-00", "2024-13-05", "2024-05-32", "2024--05", "2024-05"]:
        assert result == "2024-12-16"


# Dodatkowe testy dla "nip"
# OCR dla nip: cyfry i '-'
@pytest.mark.parametrize("input_text", [
    "001-23-45-678",  # dużo zer wiodących, powinno być 10 cyfr
    "12-34-567",      # za krótko
    "1234567890123",  # za długo, przycięcie
    "-----------",    # same myślniki, brak cyfr
    "999-99-99-9999"  # za dużo cyfr, przycięcie
])
def test_correct_ocr_text_nip_additional(input_text):
    result = correct_ocr_text(input_text, "nip")
    # NIP zawsze 10 cyfr po przetworzeniu
    assert len(result) == 10
    assert result.isdigit()


# Dodatkowe testy dla "sum"
# OCR dla sum: cyfry, '.', ','
@pytest.mark.parametrize("input_text,expected_pattern", [
    ("123,4.5,", r"^\d+\.\d{2}$"),      # mieszanka przecinków i kropek
    ("...,,,", r"^\d+\.\d{2}$"),        # same interpunkcje, brak cyfr => "00.00"
    ("9999999999999", r"^\d+\.\d{2}$"), # bardzo duża liczba, przycięcie do 8 cyfr części całkowitej
    ("12,,,34", r"^\d+\.\d{2}$"),       # wiele przecinków
    ("000.000", r"^\d+\.\d{2}$"),       # same zera
    ("45,", r"^\d+\.\d{2}$"),           # kończy się przecinkiem
    (".99", r"^\d+\.\d{2}$"),           # brak części całkowitej, zaczyna się kropką
    ("123.", r"^\d+\.\d{2}$")           # kończy się kropką
])
def test_correct_ocr_text_sum_additional(input_text, expected_pattern):
    result = correct_ocr_text(input_text, "sum")
    assert re.match(expected_pattern, result), f"Result {result} does not match pattern {expected_pattern}"


# Dodatkowe testy dla "transaction_number"
# OCR dla transaction_number: tylko cyfry
@pytest.mark.parametrize("input_text", [
    "000123",   # już 6 cyfr, czy brak zmian?
    "123",      # za krótko, dopełnić zerami
    "1234567890", # za długo, przycięcie
    "999",      # za krótko
    "000000",   # same zera
])
def test_correct_ocr_text_transaction_number_additional(input_text):
    result = correct_ocr_text(input_text, "transaction_number")
    assert len(result) == 6
    assert result.isdigit()