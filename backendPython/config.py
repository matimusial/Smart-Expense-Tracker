import os
import pytesseract

MAIN_PATH = os.path.dirname(__file__)

TESSERACT_DIR = os.path.join("C:", "Program Files", "Tesseract-OCR")
TESSERACT_EXE = "tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = os.path.join(TESSERACT_DIR, TESSERACT_EXE)

TEMP_PATH = os.path.join(MAIN_PATH, 'temp')

BERT_MODEL_NAME = "0.9228"
