import os

AI_TRAINING_PATH = os.path.dirname(__file__)

BERT_DATA_PATH = os.path.join(AI_TRAINING_PATH, 'bert_data')

BERT_MODEL_PATH = os.path.join(AI_TRAINING_PATH, 'bert_model')

BERT_EPOCHS = 3
BERT_BATCH_SIZE = 16
BERT_MODEL = 'allegro/herbert-large-cased'
BERT_LEARNING_RATE = 3e-5
BERT_TEST_SIZE = 0.16
