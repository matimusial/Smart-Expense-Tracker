import os

import numpy as np

from cnnTrimChecker.cnn_config import CNN_MODEL_PATH
from cnnTrimChecker.cnn_service.cnn_data_processing import process_image


def check_trimmed_image(image, model):

    class_names = [
        'negative',
        'rotated',
        'positive'
    ]
    image = process_image(image=image)

    image = image.astype('float32') / 255.0
    image = np.expand_dims(image, axis=0)
    prediction = model.predict(image, verbose=0)
    predicted_class = np.argmax(prediction, axis=1)[0]
    return class_names[predicted_class]


def load_cnn_model(model_name):
    from tensorflow.keras.models import load_model
    return load_model(os.path.join(CNN_MODEL_PATH, model_name + '.keras'))