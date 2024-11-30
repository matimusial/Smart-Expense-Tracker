from yolov5.train import run
import os
import shutil
import random

# Ścieżki do danych
images_dir = "yolo_data/images"
labels_dir = "yolo_data/labels"
output_dir = "yolo_data_tmp"

# Podfoldery wyjściowe
train_images = os.path.join(output_dir, "images/train")
val_images = os.path.join(output_dir, "images/val")
train_labels = os.path.join(output_dir, "labels/train")
val_labels = os.path.join(output_dir, "labels/val")

# Tworzenie folderów
os.makedirs(train_images, exist_ok=True)
os.makedirs(val_images, exist_ok=True)
os.makedirs(train_labels, exist_ok=True)
os.makedirs(val_labels, exist_ok=True)

# Pobieranie listy plików
images = [f for f in os.listdir(images_dir) if f.endswith(".jpg")]
random.shuffle(images)

# Podział na 80% treningowe i 20% walidacyjne
split_idx = int(0.8 * len(images))
train_files = images[:split_idx]
val_files = images[split_idx:]

# Kopiowanie plików
for file in train_files:
    shutil.copy(os.path.join(images_dir, file), train_images)
    label_file = file.replace(".jpg", ".txt")
    shutil.copy(os.path.join(labels_dir, label_file), train_labels)

for file in val_files:
    shutil.copy(os.path.join(images_dir, file), val_images)
    label_file = file.replace(".jpg", ".txt")
    shutil.copy(os.path.join(labels_dir, label_file), val_labels)

run(
    data="data.yaml",          # Plik konfiguracji danych
    imgsz=640,                 # Rozmiar obrazu
    batch_size=16,             # Wielkość batcha
    epochs=50,                 # Liczba epok
    weights="yolov5s.pt",      # Wagi początkowe (pre-trained YOLOv5s)
    project="runs/train",      # Folder wyników
    name="custom_yolo"         # Nazwa treningu
)

shutil.rmtree(output_dir)

print("Trening zakończony i dane tymczasowe usunięte!")
