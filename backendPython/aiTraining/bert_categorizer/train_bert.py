import os
import logging
import warnings
from absl import logging as absl_logging
from transformers import logging as transformers_logging

# Ignorowanie FutureWarnings
warnings.simplefilter(action='ignore', category=FutureWarning)

# Konfiguracja logowania
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
logging.basicConfig(level=logging.ERROR)
import tensorflow as tf

tf.config.optimizer.set_experimental_options({"disable_meta_optimizer": True})
absl_logging.set_verbosity(absl_logging.ERROR)
transformers_logging.set_verbosity_error()

import pickle
from config import BERT_DATA_PATH, BERT_EPOCHS, BERT_BATCH_SIZE, BERT_MODEL_PATH

from transformers import AutoTokenizer, TFAutoModelForSequenceClassification
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt


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
                print(f"Duplikaty w kategorii '{category}': {set(duplicates)}")
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
        # clean_up_tokenization_spaces=True  # Usuń ten argument
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


def train_model(train_dataset, val_dataset, num_labels):
    model = TFAutoModelForSequenceClassification.from_pretrained(
        "allegro/herbert-large-cased",
        num_labels=num_labels
    )

    # Kompilacja modelu z dodatkowymi metrykami
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=3e-5),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=[
            'accuracy',
        ]
    )

    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=BERT_EPOCHS,
        verbose=1
    )

    return model, history


def plot_training_history(history):
    num_epochs = len(history.history['loss'])

    if num_epochs < 2:
        print("Za mała liczba epok do rysowania wykresów. Przetrenuj model przez więcej epok.")
        print("Zawartość history.history:")
        for key, value in history.history.items():
            print(f"{key}: {value}")
        return

    epochs = range(1, num_epochs + 1)

    plt.figure(figsize=(12, 5))

    # Wykres strat (loss)
    plt.subplot(1, 2, 1)
    plt.plot(epochs, history.history['loss'], marker='o', label='Training Loss')
    plt.plot(epochs, history.history['val_loss'], marker='o', label='Validation Loss')
    plt.title('Loss during training')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()

    # Wykres dokładności (accuracy)
    plt.subplot(1, 2, 2)
    plt.plot(epochs, history.history['accuracy'], marker='o', label='Training Accuracy')
    plt.plot(epochs, history.history['val_accuracy'], marker='o', label='Validation Accuracy')
    plt.title('Accuracy during training')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()

    plt.tight_layout()
    plt.show()


def save_model_and_tokenizer(model, tokenizer, label_encoder, accuracy):
    import pickle
    from pathlib import Path
    from typing import cast, SupportsWrite

    bert_model_path = Path(BERT_MODEL_PATH)
    accuracy_str = f"{accuracy:.4f}"

    # Zapis modelu i tokenizer
    model.save_pretrained(bert_model_path / f"{accuracy_str}_model")
    tokenizer.save_pretrained(bert_model_path / f"{accuracy_str}_tokenizer")

    # Ścieżka do zapisu encodera
    encoder_path = bert_model_path / f"{accuracy_str}_encoder"

    # Rzutowanie pliku na SupportsWrite[bytes]
    with open(encoder_path, 'wb') as f:
        pickle.dump(label_encoder, cast(SupportsWrite[bytes], f))


if __name__ == "__main__":
    data_dict = get_bert_data_dict()
    data = get_pair_list(data_dict)

    texts = [example[0] for example in data]
    labels = [example[1] for example in data]

    encoded_labels, label_encoder = encode_labels(labels)
    num_labels = len(label_encoder.classes_)

    train_texts, temp_texts, train_labels, temp_labels = train_test_split(
        texts,
        encoded_labels,
        test_size=0.2,
        random_state=42,
        stratify=encoded_labels
    )

    val_texts, test_texts, val_labels, test_labels = train_test_split(
        temp_texts,
        temp_labels,
        test_size=0.5,
        random_state=42,
        stratify=temp_labels
    )

    tokenizer = AutoTokenizer.from_pretrained("allegro/herbert-large-cased")
    train_inputs = tokenize_texts(train_texts, tokenizer)
    val_inputs = tokenize_texts(val_texts, tokenizer)
    test_inputs = tokenize_texts(test_texts, tokenizer)

    train_dataset = create_tf_dataset(train_inputs, train_labels)
    val_dataset = create_tf_dataset(val_inputs, val_labels)
    test_dataset = create_tf_dataset(test_inputs, test_labels)

    model, history = train_model(train_dataset, val_dataset, num_labels)

    plot_training_history(history)

    loss, accuracy = model.evaluate(test_dataset)
    print(f"Test Loss: {loss}, Test Accuracy: {accuracy}")

    save_model_and_tokenizer(model, tokenizer, label_encoder, accuracy)
