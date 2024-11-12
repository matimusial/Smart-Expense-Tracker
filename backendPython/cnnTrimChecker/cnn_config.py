import os

CNN_TRAINING_PATH = os.path.dirname(__file__)

CNN_INPUT_SIZE = (224, 224)
CNN_EPOCHS = 10
CNN_BATCH_SIZE = 32

CNN_MODEL_PATH = os.path.join(CNN_TRAINING_PATH, 'cnn_model')

CNN_DATA_PATH = os.path.join(CNN_TRAINING_PATH, 'cnn_data')

SEQUENCE_1 = {
    "model_name": "0.9737",
    "combination_list": [
        ((3, 3), (5, 5), 3, 0.07, 2, 0),
        ((3, 3), (13, 13), 1, 0.07, 2, 0),
        ((3, 3), (19, 19), 1, 0.07, 2, 0),
        ((9, 9), (7, 7), 1, 0.04, 1, 0),
        ((3, 3), (19, 19), 3, 0.06, 0, 0),
        ((5, 5), (7, 7), 3, 0.05, 2, 0),
        ((19, 19), (19, 19), 3, 0.03, 0, 0),
        ((3, 3), (11, 11), 1, 0.08, 2, 2),
        ((11, 11), (19, 19), 3, 0.05, 2, 1),
        ((3, 3), (19, 19), 3, 0.02, 2, 0),
        ((7, 7), (19, 19), 2, 0.05, 0, 2),
        ((3, 3), (5, 5), 2, 0.03, 1, 0),
        ((11, 11), (11, 11), 1, 0.05, 2, 0),
        ((9, 9), (11, 11), 3, 0.04, 0, 1),
        ((3, 3), (3, 3), 1, 0.05, 2, 2),
        ((3, 3), (5, 5), 3, 0.04, 0, 0),
        ((3, 3), (9, 9), 1, 0.04, 2, 2),
        ((3, 3), (11, 11), 1, 0.02, 2, 2),
        ((3, 3), (11, 11), 1, 0.04, 2, 0),
        ((3, 3), (11, 11), 1, 0.05, 2, 0),
        ((5, 5), (9, 9), 3, 0.06, 2, 0),
        ((5, 5), (11, 11), 3, 0.06, 0, 0),
        ((7, 7), (9, 9), 3, 0.04, 1, 0),
        ((7, 7), (11, 11), 1, 0.04, 2, 0),
        ((7, 7), (11, 11), 3, 0.03, 0, 0),
        ((9, 9), (3, 3), 1, 0.03, 0, 0),
        ((11, 11), (3, 3), 1, 0.08, 0, 0),
        ((11, 11), (11, 11), 3, 0.05, 2, 0),
        ((3, 3), (11, 11), 3, 0.06, 2, 0),
        ((3, 3), (13, 13), 3, 0.08, 0, 0),
        ((3, 3), (19, 19), 1, 0.05, 2, 0),
        ((3, 3), (19, 19), 1, 0.06, 2, 0),
        ((7, 7), (19, 19), 3, 0.03, 2, 1),
        ((3, 3), (13, 13), 3, 0.05, 0, 1),
        ((3, 3), (19, 19), 3, 0.06, 0, 1),
        ((3, 3), (11, 11), 2, 0.06, 0, 2),
        ((3, 3), (9, 9), 2, 0.05, 0, 1),
        ((5, 5), (19, 19), 2, 0.06, 0, 2),
        ((3, 3), (5, 5), 3, 0.04, 0, 2),
        ((19, 19), (19, 19), 2, 0.05, 0, 1),
        ((9, 9), (19, 19), 3, 0.05, 0, 1),
        ((3, 3), (11, 11), 3, 0.03, 0, 2),
        ((19, 19), (19, 19), 2, 0.06, 0, 2)]
}

SEQUENCE_2 = {
    "model_name": "0.9708",
    "combination_list": [
        ((3, 3), (7, 7), 2, 0.07, 1, 0),
        ((3, 3), (19, 19), 1, 0.07, 2, 0),
        ((5, 5), (19, 19), 3, 0.09, 2, 1),
        ((3, 3), (11, 11), 1, 0.05, 2, 1),
        ((5, 5), (11, 11), 3, 0.05, 0, 0),
        ((3, 3), (19, 19), 3, 0.04, 2, 0),
        ((3, 3), (13, 13), 1, 0.05, 2, 0),
        ((11, 11), (3, 3), 3, 0.04, 0, 0),
        ((3, 3), (19, 19), 3, 0.01, 0, 0),
        ((7, 7), (19, 19), 3, 0.05, 0, 0),
        ((5, 5), (11, 11), 3, 0.09, 0, 0),
        ((19, 19), (19, 19), 3, 0.08, 2, 1),
        ((5, 5), (11, 11), 2, 0.04, 1, 0),
        ((5, 5), (19, 19), 1, 0.05, 2, 0),
        ((11, 11), (19, 19), 3, 0.05, 2, 0),
        ((13, 13), (19, 19), 3, 0.01, 1, 0),
        ((5, 5), (19, 19), 2, 0.07, 0, 1),
        ((19, 19), (3, 3), 3, 0.02, 0, 1),
        ((3, 3), (9, 9), 3, 0.02, 2, 1),
        ((3, 3), (19, 19), 3, 0.06, 0, 1),
        ((5, 5), (9, 9), 1, 0.06, 2, 2),
        ((5, 5), (11, 11), 1, 0.01, 2, 2),
        ((9, 9), (13, 13), 3, 0.02, 0, 0),
        ((19, 19), (19, 19), 1, 0.02, 1, 0),
        ((19, 19), (19, 19), 3, 0.07, 2, 0),
        ((9, 9), (19, 19), 3, 0.04, 0, 2),
        ((11, 11), (19, 19), 2, 0.03, 0, 2),
        ((3, 3), (9, 9), 1, 0.03, 2, 2),
        ((3, 3), (9, 9), 1, 0.09, 2, 0),
        ((3, 3), (11, 11), 1, 0.09, 0, 0),
        ((3, 3), (11, 11), 3, 0.06, 2, 0),
        ((3, 3), (13, 13), 3, 0.08, 1, 0),
        ((3, 3), (13, 13), 3, 0.09, 2, 1),
        ((3, 3), (19, 19), 2, 0.08, 1, 0),
        ((3, 3), (19, 19), 3, 0.08, 2, 0),
        ((5, 5), (11, 11), 3, 0.01, 1, 0),
        ((5, 5), (11, 11), 3, 0.08, 2, 0),
        ((5, 5), (19, 19), 3, 0.05, 2, 0),
        ((7, 7), (11, 11), 1, 0.05, 2, 2),
        ((9, 9), (19, 19), 1, 0.02, 2, 0),
        ((9, 9), (19, 19), 3, 0.01, 0, 0),
        ((11, 11), (5, 5), 3, 0.04, 2, 1),
        ((19, 19), (3, 3), 3, 0.05, 0, 0),
        ((5, 5), (13, 13), 3, 0.01, 0, 1),
        ((19, 19), (19, 19), 2, 0.01, 0, 1),
        ((7, 7), (3, 3), 2, 0.03, 0, 1),
        ((5, 5), (11, 11), 2, 0.02, 0, 2),
        ((7, 7), (5, 5), 3, 0.07, 0, 2),
        ((19, 19), (5, 5), 2, 0.06, 0, 2),
        ((3, 3), (3, 3), 3, 0.04, 0, 1),
        ((7, 7), (3, 3), 3, 0.02, 0, 1),
        ((19, 19), (7, 7), 2, 0.04, 0, 1),
        ((3, 3), (5, 5), 2, 0.01, 0, 2),
        ((11, 11), (7, 7), 2, 0.02, 0, 1)
    ]
}
