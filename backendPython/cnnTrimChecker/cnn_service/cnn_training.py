import os
from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dropout, Flatten, Dense, Input

from cnnTrimChecker.cnn_config import CNN_MODEL_PATH, CNN_INPUT_SIZE, CNN_EPOCHS, CNN_BATCH_SIZE
from cnnTrimChecker.cnn_service.cnn_data_processing import load_data


X, y = load_data()
X /= 255.0


X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y)

model = Sequential([
    Input(shape=(CNN_INPUT_SIZE[1], CNN_INPUT_SIZE[0], 3)),
    Conv2D(32, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Dropout(0.25),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Dropout(0.25),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Dropout(0.25),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(3, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history = model.fit(
    X_train, y_train,
    epochs=CNN_EPOCHS,
    batch_size=CNN_BATCH_SIZE,
    validation_data=(X_val, y_val)
)

_, val_accuracy = model.evaluate(X_val, y_val, verbose=0)

model.save(os.path.join(CNN_MODEL_PATH, f'{round(val_accuracy, 4)}.keras'))
