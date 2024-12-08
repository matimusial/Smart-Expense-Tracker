import os

MAIN_PATH = os.path.dirname(__file__)

TEMP_PATH = os.path.join(MAIN_PATH, 'temp')

BERT_MODEL_NAME = "0.9228"
CNN_FIND_SEQUENCE_MODEL_NAME = '0.9875'

YOLO_PATH = os.path.join(MAIN_PATH, 'yoloTrainer', 'yolo_training_runs', 'run_6_200_16_0.0015_yolov8m-obb.pt', 'weights',
                         'best.pt')

EXAMPLE_RECEIPTS_PATH = os.path.join(MAIN_PATH, 'exampleReceipts')
