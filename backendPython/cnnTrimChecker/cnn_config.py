import os

CNN_TRAINING_PATH = os.path.dirname(__file__)

CNN_INPUT_SIZE = (224, 224)
CNN_EPOCHS = 15
CNN_BATCH_SIZE = 32

CNN_MODEL_PATH = os.path.join(CNN_TRAINING_PATH, 'cnn_model')

CNN_DATA_PATH = os.path.join(CNN_TRAINING_PATH, 'cnn_data')
