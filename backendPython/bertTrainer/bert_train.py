import os

import numpy as np
from transformers import AutoTokenizer
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from bert_categorizer.bert_data_processing import get_bert_data_dict, get_pair_list, tokenize_texts, encode_labels, \
    create_tf_dataset
from bert_categorizer.bert_train_service import train_model, plot_training_history, save_model_and_tokenizer, print_metrics

from bert_config import BERT_MODEL, BERT_TEST_SIZE


if __name__ == '__main__':

    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    data_dict = get_bert_data_dict()
    data = get_pair_list(data_dict)

    texts = [example[0] for example in data]
    labels = [example[1] for example in data]

    encoded_labels, label_encoder = encode_labels(labels)
    num_labels = len(label_encoder.classes_)

    train_texts, temp_texts, train_labels, temp_labels = train_test_split(
        texts,
        encoded_labels,
        test_size=BERT_TEST_SIZE,
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

    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_labels),
        y=train_labels
    )
    class_weights = class_weights.astype(float)
    max_weight = max(class_weights)
    class_weights_normalized = class_weights / max_weight
    class_weights_dict = {int(i): float(w) for i, w in enumerate(class_weights_normalized)}

    tokenizer = AutoTokenizer.from_pretrained(BERT_MODEL)
    train_inputs = tokenize_texts(train_texts, tokenizer)
    val_inputs = tokenize_texts(val_texts, tokenizer)
    test_inputs = tokenize_texts(test_texts, tokenizer)

    train_dataset = create_tf_dataset(train_inputs, train_labels)
    val_dataset = create_tf_dataset(val_inputs, val_labels)
    test_dataset = create_tf_dataset(test_inputs, test_labels)

    model, history = train_model(train_dataset, val_dataset, num_labels, class_weights_dict)

    plot_training_history(history)

    print_metrics(model, test_inputs, test_labels)

    loss, accuracy = model.evaluate(test_dataset)
    print(f"Test Loss: {loss:.4f}, Test Accuracy: {accuracy:.4f}")

    save_model_and_tokenizer(model, tokenizer, label_encoder, accuracy)
