import os
import pickle
import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForSequenceClassification

from bertTrainer.bert_config import BERT_MODEL_PATH


def load_model_and_tokenizer(accuracy):

    model = TFAutoModelForSequenceClassification.from_pretrained(os.path.join(BERT_MODEL_PATH, accuracy, "model"))

    tokenizer = AutoTokenizer.from_pretrained(os.path.join(BERT_MODEL_PATH, accuracy, "tokenizer"))

    with open(os.path.join(BERT_MODEL_PATH, accuracy, "encoder"), 'rb') as f:
        label_encoder = pickle.load(f)

    return model, tokenizer, label_encoder


def predict_top_k(text, model, tokenizer, label_encoder, k):
    inputs = tokenizer(
        text,
        padding=True,
        truncation=True,
        max_length=128,
        return_tensors="tf"
    )

    logits = model(**inputs).logits
    probabilities = tf.nn.softmax(logits, axis=-1).numpy()[0]

    top_k_values, top_k_indices = tf.nn.top_k(logits, k=k)
    top_k_indices = top_k_indices.numpy()[0]
    normalized_scores = probabilities[top_k_indices]
    predicted_labels = label_encoder.inverse_transform(top_k_indices)

    return list(zip(predicted_labels, [round(score, 3) for score in normalized_scores]))
