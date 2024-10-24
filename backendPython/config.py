import os
import pytesseract

MAIN_PATH = os.path.dirname(__file__)

TESSERACT_DIR = os.path.join("C:", "Program Files", "Tesseract-OCR")
TESSERACT_EXE = "tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = os.path.join(TESSERACT_DIR, TESSERACT_EXE)

TEMP_PATH = os.path.join(MAIN_PATH, 'temp')

BERT_MODEL_NAME = "0.9228"

BLUR_KERNEL_SIZE = (5, 5)
CANNY_LOW = 100
CANNY_HIGH = 200
MORPH_KERNEL_SIZE = (5, 5)
MORPH_ITERATIONS = 2
EPSILON_FACTOR = 0.03
DILATION_ITERATIONS = 2
EROSION_ITERATIONS = 2