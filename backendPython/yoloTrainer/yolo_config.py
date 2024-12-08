import os

CLASS_NAMES = ["date", "nip", "payment_type", "sum", "transaction_number"]
CONF_THRESHOLD = 0.5
FUZZY_THRESHOLD = 0.5

YOLO_TRAINING_PATH = os.path.dirname(os.path.abspath(__file__))
YOLO_MODELS_PATH = os.path.join(YOLO_TRAINING_PATH, 'models')
YOLO_DATA_PATH = os.path.join(YOLO_TRAINING_PATH, 'yolo_data')
YOLO_RUNS_DIR = os.path.join(YOLO_TRAINING_PATH, 'yolo_training_runs')
YOLO_TRAIN_SIZE = 0.8

