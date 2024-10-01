import os
import pickle
from config import BERT_DATA_PATH, BERT_EPOCHS

import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForSequenceClassification
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.metrics import Precision, Recall
import tensorflow_addons as tfa


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
    )
    return tokenized_inputs


def encode_labels(labels):
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)
    return encoded_labels, label_encoder


def create_tf_dataset(tokenized_inputs, labels, batch_size=32):
    labels = tf.convert_to_tensor(labels)
    dataset = tf.data.Dataset.from_tensor_slices((dict(tokenized_inputs), labels))
    dataset = dataset.shuffle(len(labels)).batch(batch_size)
    return dataset


def train_model(train_dataset, val_dataset, num_labels, epochs=5):
    # Wczytanie pretrenowanego modelu
    model = TFAutoModelForSequenceClassification.from_pretrained(
        "allegro/herbert-large-cased",
        num_labels=num_labels
    )

    # Kompilacja modelu z dodatkowymi metrykami
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=3e-5),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=[
            'accuracy',  # Monitorowanie dokładności
            Precision(name='precision'),  # Precyzja
            Recall(name='recall'),  # Czułość (Recall)
            tfa.metrics.F1Score(num_classes=num_labels, average='weighted')  # F1-score
        ]
    )

    # # Early stopping: zatrzymanie modelu, jeśli metryki przestają się poprawiać
    # early_stopping = EarlyStopping(
    #     monitor='val_loss',  # Monitorowanie straty walidacyjnej
    #     patience=2,  # Zatrzymanie po 2 epokach bez poprawy
    #     restore_best_weights=True  # Przywrócenie najlepszych wag
    # )

    # Trenowanie modelu z monitoringiem
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=epochs,
        # callbacks=[early_stopping],  # Dodanie callbacku early stopping
        verbose=2  # Wyświetlanie jednej linii na epokę
    )

    return model, history


def plot_training_history(history):
    # Wyświetlanie strat (loss) dla zbioru treningowego i walidacyjnego
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Loss during training')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    plt.show()

    # Wyświetlanie dokładności (accuracy) dla zbioru treningowego i walidacyjnego
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Accuracy during training')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.show()


def save_model_and_tokenizer(model, tokenizer, label_encoder, accuracy):
    from config import BERT_MODEL_PATH
    accuracy_str = f"{accuracy:.4f}"
    model.save_pretrained(os.path.join(BERT_MODEL_PATH, accuracy_str + "_model"))
    tokenizer.save_pretrained(os.path.join(BERT_MODEL_PATH, accuracy_str + "_tokenizer"))
    with open(os.path.join(BERT_MODEL_PATH, accuracy_str + "_encoder"), 'wb') as f:
        pickle.dump(label_encoder, f)


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

    model, history = train_model(train_dataset, val_dataset, num_labels, epochs=BERT_EPOCHS)

    plot_training_history(history)

    loss, accuracy = model.evaluate(test_dataset)
    print(f"Test Loss: {loss}, Test Accuracy: {accuracy}")

    save_model_and_tokenizer(model, tokenizer, label_encoder, accuracy)
