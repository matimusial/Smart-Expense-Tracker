import os
import shutil
import random
import yaml
from ultralytics import YOLO

from yolo_config import YOLO_DATA_PATH, YOLO_TRAINING_PATH, YOLO_MODELS_PATH, YOLO_TRAIN_SIZE, YOLO_RUNS_DIR


def create_temp_yolo_structure(original_images_dir, original_labels_dir, temp_dir):
    images_train_dir = os.path.join(temp_dir, 'images', 'train')
    images_val_dir = os.path.join(temp_dir, 'images', 'val')
    labels_train_dir = os.path.join(temp_dir, 'labels', 'train')
    labels_val_dir = os.path.join(temp_dir, 'labels', 'val')

    os.makedirs(images_train_dir, exist_ok=True)
    os.makedirs(images_val_dir, exist_ok=True)
    os.makedirs(labels_train_dir, exist_ok=True)
    os.makedirs(labels_val_dir, exist_ok=True)

    image_files = [f for f in os.listdir(original_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    random.shuffle(image_files)

    split_index = int(len(image_files) * YOLO_TRAIN_SIZE)
    train_files = image_files[:split_index]
    val_files = image_files[split_index:]

    for file in train_files:
        shutil.copy(os.path.join(original_images_dir, file), os.path.join(images_train_dir, file))
        label_file = os.path.splitext(file)[0] + '.txt'
        shutil.copy(os.path.join(original_labels_dir, label_file), os.path.join(labels_train_dir, label_file))

    for file in val_files:
        shutil.copy(os.path.join(original_images_dir, file), os.path.join(images_val_dir, file))
        label_file = os.path.splitext(file)[0] + '.txt'
        shutil.copy(os.path.join(original_labels_dir, label_file), os.path.join(labels_val_dir, label_file))


def generate_data_yaml(temp_dir, yaml_path, nc, names):
    data = {
        'train': os.path.join(YOLO_TRAINING_PATH, temp_dir, 'images', 'train'),
        'val': os.path.join(YOLO_TRAINING_PATH, temp_dir, 'images', 'val'),
        'nc': nc,
        'names': names
    }
    with open(yaml_path, 'w') as f:
        yaml.dump(data, f)


def train_yolov8_obb(data_yaml, weights, epochs, batch, imgsz, device, name, workers, lr0):
    model = YOLO(weights)
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch,
        imgsz=imgsz,
        device=device,
        name=name,
        workers=workers,
        lr0=lr0
    )
    return results.save_dir, results


def main():
    original_images_dir = os.path.join(YOLO_DATA_PATH, 'images')
    original_labels_dir = os.path.join(YOLO_DATA_PATH, 'labels')

    if not os.path.exists(original_images_dir):
        print(f"Folder z obrazami nie istnieje: {original_images_dir}")
        return
    if not os.path.exists(original_labels_dir):
        print(f"Folder z labelami nie istnieje: {original_labels_dir}")
        return

    classes = ['date', 'nip', 'payment_type', 'sum', 'transaction_number']
    nc = len(classes)

    num_runs = 1

    models = [
        'yolov8n-obb.pt',
        'yolov8n-obb.pt',
        'yolov8m-obb.pt',
        'yolov8m-obb.pt',
        'yolov8m-obb.pt',
        'yolov8m-obb.pt',
        'yolov8m-obb.pt',
    ]

    epochs_list = [50, 100, 50, 100, 150, 200, 100]
    batch_list = [8, 16, 8, 16, 16, 16, 8]
    lr0_list = [0.001, 0.0015, 0.001, 0.0015, 0.002, 0.0015, 0.001]

    device = 'cpu'
    base_workers = 16

    os.makedirs(YOLO_RUNS_DIR, exist_ok=True)

    for run in range(1, num_runs + 1):
        print(f"\n=== Rozpoczynanie treningu nr {run} ===")

        epochs = epochs_list[run - 1]
        batch = batch_list[run - 1]
        lr0 = lr0_list[run - 1]

        run_dir = os.path.join(YOLO_RUNS_DIR, f'run_{run}_{epochs}_{batch}_{lr0}_{models[run-1]}')
        os.makedirs(run_dir, exist_ok=True)

        temp_dir = os.path.join(run_dir, 'yolo_data_tmp')
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)

        try:
            create_temp_yolo_structure(original_images_dir, original_labels_dir, temp_dir)

            data_yaml_path = os.path.join(temp_dir, 'data.yaml')
            generate_data_yaml(temp_dir, data_yaml_path, nc, classes)

            run_name = f"yolov8_obb_train_{run}"

            weights_path = os.path.join(YOLO_MODELS_PATH, models[run-1])
            if not os.path.exists(weights_path):
                print(f"Model {weights_path} nie istnieje!")
                return

            save_dir, results = train_yolov8_obb(
                data_yaml=data_yaml_path,
                weights=weights_path,
                epochs=epochs,
                batch=batch,
                imgsz=640,
                device=device,
                name=run_name,
                workers=base_workers,
                lr0=lr0
            )
            shutil.move(save_dir, run_dir)

        except Exception as e:
            print(f"Wystąpił błąd podczas treningu nr {run}: {e}")
        finally:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    print("\n=== Wszystkie treningi zakończone ===")


if __name__ == "__main__":
    main()
