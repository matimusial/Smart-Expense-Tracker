import os
import pickle
import tensorflow as tf

from matplotlib import pyplot as plt
from transformers import TFAutoModelForSequenceClassification
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix, classification_report
import numpy as np


from bertTrainer.bert_config import BERT_MODEL, BERT_LEARNING_RATE, BERT_EPOCHS, BERT_MODEL_PATH


def train_model(train_dataset, val_dataset, num_labels, class_weights_dict):
    print("Number of available GPUs:", len(tf.config.experimental.list_physical_devices('GPU')))
    model = TFAutoModelForSequenceClassification.from_pretrained(
        BERT_MODEL,
        num_labels=num_labels
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=BERT_LEARNING_RATE),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=['accuracy']
    )

    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=BERT_EPOCHS,
        verbose=1,
        class_weight=class_weights_dict
    )

    return model, history


def plot_training_history(history):
    num_epochs = len(history.history['loss'])

    if num_epochs < 2:
        print("Too few epochs to draw the graphs")
        return

    epochs = range(1, num_epochs + 1)

    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.plot(epochs, history.history['loss'], marker='o', label='Training Loss')
    plt.plot(epochs, history.history['val_loss'], marker='o', label='Validation Loss')
    plt.title('Loss during training')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()

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
    accuracy_str = f"{accuracy:.4f}"

    model.save_pretrained(os.path.join(BERT_MODEL_PATH, accuracy_str, "model"))
    tokenizer.save_pretrained(os.path.join(BERT_MODEL_PATH, accuracy_str, "tokenizer"))

    encoder_path = os.path.join(BERT_MODEL_PATH, accuracy_str, "encoder")

    with open(encoder_path, 'wb') as f:
        pickle.dump(label_encoder, f)


def print_metrics(model, test_dataset, test_labels):
    predictions = model.predict(test_dataset).logits
    predicted_labels = np.argmax(predictions, axis=1)

    precision = precision_score(test_labels, predicted_labels, average='weighted')
    recall = recall_score(test_labels, predicted_labels, average='weighted')
    f1 = f1_score(test_labels, predicted_labels, average='weighted')

    print("Confusion Matrix:")
    print(confusion_matrix(test_labels, predicted_labels))

    print("\nClassification Report:")
    print(classification_report(test_labels, predicted_labels))

    print(f"\nPrecision (Weighted): {precision:.4f}")
    print(f"Recall (Weighted): {recall:.4f}")
    print(f"F1-Score (Weighted): {f1:.4f}")
