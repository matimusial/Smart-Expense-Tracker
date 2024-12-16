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
    'clean_background': None,
    'clean_bg_function_ksize': None,
    'clean_bg_gaussian_ksize': None,
    'denoise': None,
    'median_kernel': None,
    'bilateral_params': None,
    'enhance_contrast': None,
    'clahe_params': None,
    'gamma': None,
    'adaptive_threshold': None,
    'adaptive_block_size': None,
    'adaptive_c': None,
    'morphological_operation': None,
    'close_kernel': None,
    'erode_kernel': None,
    'open_kernel': None,
    'dilate_kernel': None,
}
