import os

import cv2
import numpy as np

from cnnTrimChecker.cnn_config import CNN_INPUT_SIZE, CNN_DATA_PATH


def process_image(image_path=None, image=None):
    if image is None:
        image = cv2.imread(image_path)
    if image is None:
        print(f"Error loading image: {image_path}")
        return None

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    height, width = image.shape[:2]
    scale_factor = min(CNN_INPUT_SIZE[0] / width, CNN_INPUT_SIZE[1] / height)
    new_size = (int(width * scale_factor), int(height * scale_factor))
    scaled_image = cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)
    delta_w = CNN_INPUT_SIZE[0] - new_size[0]
    delta_h = CNN_INPUT_SIZE[1] - new_size[1]
    top, bottom = delta_h // 2, delta_h - (delta_h // 2)
    left, right = delta_w // 2, delta_w - (delta_w // 2)
    padding_color = [1, 1, 1]
    new_image = cv2.copyMakeBorder(scaled_image, top, bottom, left, right, cv2.BORDER_CONSTANT, value=padding_color)
    return new_image


def load_images_from_folder(folder_path, label):
    images = []
    labels = []

    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        if os.path.isfile(file_path):
            image = process_image(file_path)
            if image is not None:
                images.append(image)
                labels.append(label)

    return images, labels


def load_data():
    folders = {
        'negative': 0,
        'rotated': 1,
        'positive': 2
    }

    all_images = []
    all_labels = []

    for folder, label in folders.items():
        folder_path = os.path.join(CNN_DATA_PATH, folder)
        images, labels = load_images_from_folder(folder_path, label)
        all_images.extend(images)
        all_labels.extend(labels)

    return np.array(all_images, dtype='float32'), np.array(all_labels, dtype='int')
