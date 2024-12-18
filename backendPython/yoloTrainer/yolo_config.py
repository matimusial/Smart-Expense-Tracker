import os

CLASS_NAMES = ["date", "nip", "payment_type", "sum", "transaction_number"]
CONF_THRESHOLD = 0.5
FUZZY_THRESHOLD = 0.5

YOLO_TRAINING_PATH = os.path.dirname(os.path.abspath(__file__))
YOLO_MODELS_PATH = os.path.join(YOLO_TRAINING_PATH, 'models')
YOLO_DATA_PATH = os.path.join(YOLO_TRAINING_PATH, 'yolo_data')
YOLO_RUNS_DIR = os.path.join(YOLO_TRAINING_PATH, 'yolo_training_runs')
YOLO_TRAIN_SIZE = 0.8

OCR_PROCESSING_CONFIGURATION = {
    'clean_background': False,
    'morphological_operation': False,
    'gamma': False,
    'enhance_contrast': 'clahe',
    'adaptive_threshold': 'otsu',

    'clean_bg_function_ksize': 15,
    'clean_bg_gaussian_ksize': (21, 21),
    'denoise': 'bilateral',
    'median_kernel': 3,
    'bilateral_params': (9, 75, 75),
    'clahe_params': (2.0, (8, 8)),
    'adaptive_block_size': 15,
    'adaptive_c': 3,
    'close_kernel': (5, 5),
    'open_kernel': (2, 2),
    'erode_kernel': (2, 2),
    'dilate_kernel': (3, 3)
}

