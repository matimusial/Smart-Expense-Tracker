import os

MAIN_PATH = os.path.dirname(__file__)

BERT_MODEL_NAME = "0.9228"
YOLO_MODEL = 'run_6_200_16_0.0015_yolov8m-obb.pt'

PYTESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe" #should be raw
YOLO_PATH = os.path.join(MAIN_PATH, 'yoloTrainer', 'yolo_training_runs', YOLO_MODEL, 'weights','best.pt')

OTHER_SERVICES_ADRESSES = [
    "http://localhost:3000",
    "http://localhost:8000",
]
