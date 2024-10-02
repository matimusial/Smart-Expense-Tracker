import os
import pickle
import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForSequenceClassification

#test

def load_model_and_tokenizer(accuracy):
    from config import BERT_MODEL_PATH
    model = TFAutoModelForSequenceClassification.from_pretrained(os.path.join(BERT_MODEL_PATH, accuracy+"_model"))

    # Wczytanie tokenizer'a
    tokenizer = AutoTokenizer.from_pretrained(os.path.join(BERT_MODEL_PATH, accuracy+"_tokenizer"))

    # Wczytanie label encoder'a
    with open(os.path.join(BERT_MODEL_PATH, accuracy+"_encoder"), 'rb') as f:
        label_encoder = pickle.load(f)

    return model, tokenizer, label_encoder


def predict_top_k(text, model, tokenizer, label_encoder, k):
    # Tokenizacja tekstu
    inputs = tokenizer(
        text,
        padding=True,
        truncation=True,
        max_length=128,
        return_tensors="tf"
    )

    # Predykcja
    logits = model(**inputs).logits

    # Uzyskanie trzech najwyższych prawdopodobieństw
    top_k_values, top_k_indices = tf.nn.top_k(logits, k=k)

    # Odkodowanie trzech najwyższych etykiet
    predicted_labels = label_encoder.inverse_transform(top_k_indices.numpy()[0])

    # Zwrócenie etykiet oraz odpowiadających im prawdopodobieństw
    return list(zip(predicted_labels, top_k_values.numpy()[0]))


if __name__ == "__main__":

    # Wczytanie modelu, tokenizer'a i label encoder'a
    model, tokenizer, label_encoder = load_model_and_tokenizer(accuracy="0.9034")

    # Przykładowy tekst do predykcji
    text = "yrc6r4dcyvctfdxser4wsrdsxfrdtxewwe"

    # Predykcja trzech najbardziej prawdopodobnych kategorii
    predicted_categories = predict_top_k(text, model, tokenizer, label_encoder, k=3)

    # Wyświetlanie wyników
    for category, score in predicted_categories:
        print(f"Predicted Category: {category}, Score: {score}")
