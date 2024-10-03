import os

import tensorflow as tf
from sklearn.preprocessing import LabelEncoder

from config import BERT_DATA_PATH, BERT_BATCH_SIZE


def get_bert_data_dict():
    data_dict = {}
    for filename in os.listdir(BERT_DATA_PATH):
        category = filename.split('.')[0]
        file_path = os.path.join(BERT_DATA_PATH, filename)
        with open(file_path, 'r', encoding='utf-8') as file:
            phrases = file.read().strip().split(',')
            phrases = [phrase.strip() for phrase in phrases if phrase]
            duplicates = [phrase for phrase in phrases if phrases.count(phrase) > 1]
            if duplicates:
                print(f"Duplicates in category '{category}': {set(duplicates)}")
            data_dict[category] = list(set(phrases))
    return data_dict


def get_pair_list(data_dict):
    data = []
    for label, texts in data_dict.items():
        for text in texts:
            data.append((text, label))
    return data


def tokenize_texts(texts, tokenizer, max_length=32):
    tokenized_inputs = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=max_length,
        return_tensors="tf"
    )
    return tokenized_inputs


def encode_labels(labels):
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)
    return encoded_labels, label_encoder


def create_tf_dataset(tokenized_inputs, labels):
    labels = tf.convert_to_tensor(labels)
    dataset = tf.data.Dataset.from_tensor_slices((dict(tokenized_inputs), labels))
    dataset = dataset.shuffle(len(labels)).batch(BERT_BATCH_SIZE).cache().prefetch(tf.data.AUTOTUNE)
    return dataset
