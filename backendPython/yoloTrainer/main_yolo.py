import os
import shutil
import random
import yaml
import csv
from ultralytics import YOLO


def create_temp_yolo_structure(original_images_dir, original_labels_dir, temp_dir, train_ratio=0.8):
    # Ścieżki do nowych folderów
    images_train_dir = os.path.join(temp_dir, 'images', 'train')
    images_val_dir = os.path.join(temp_dir, 'images', 'val')
    labels_train_dir = os.path.join(temp_dir, 'labels', 'train')
    labels_val_dir = os.path.join(temp_dir, 'labels', 'val')

    # Tworzenie folderów
    os.makedirs(images_train_dir, exist_ok=True)
    os.makedirs(images_val_dir, exist_ok=True)
    os.makedirs(labels_train_dir, exist_ok=True)
    os.makedirs(labels_val_dir, exist_ok=True)

    # Pobranie listy plików obrazów
    image_files = [f for f in os.listdir(original_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    random.shuffle(image_files)

    # Podział na trening i walidację
    split_index = int(len(image_files) * train_ratio)
    train_files = image_files[:split_index]
    val_files = image_files[split_index:]

    # Kopiowanie plików
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
        'train': os.path.abspath(os.path.join(temp_dir, 'images', 'train')),
        'val': os.path.abspath(os.path.join(temp_dir, 'images', 'val')),
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


def save_metrics_to_csv(csv_path, run_number, metrics, best_model_path):
    file_exists = os.path.isfile(csv_path)

    # Otwórz plik w trybie dołączania
    with open(csv_path, mode='a', newline='') as csv_file:
        fieldnames = ['Run', 'Best Model', 'mAP@0.5', 'mAP@0.5:0.95', 'Precision', 'Recall', 'Loss']
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        if not file_exists:
            writer.writeheader()

        writer.writerow({
            'Run': run_number,
            'Best Model': os.path.basename(best_model_path),
            'mAP@0.5': metrics.get('mAP50', 0),
            'mAP@0.5:0.95': metrics.get('mAP50-95', 0),
            'Precision': metrics.get('precision', 0),
            'Recall': metrics.get('recall', 0),
            'Loss': metrics.get('loss', 0)
        })


def main():
    # Aktualna lokalizacja skryptu
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Ścieżki do oryginalnych danych
    original_images_dir = os.path.join(script_dir, 'yolo_data', 'images')
    original_labels_dir = os.path.join(script_dir, 'yolo_data', 'labels')

    # Sprawdzenie, czy foldery istnieją
    if not os.path.exists(original_images_dir):
        print(f"Folder z obrazami nie istnieje: {original_images_dir}")
        return
    if not os.path.exists(original_labels_dir):
        print(f"Folder z labelami nie istnieje: {original_labels_dir}")
        return

    classes = ['date', 'nip', 'payment_type', 'sum', 'transaction_number']
    nc = len(classes)

    num_runs = 10

    models = [
        'yolov8n-obb.pt',  # run 1
        'yolov8m-obb.pt',  # run 2
        'yolov8l-obb.pt',  # run 3
        'yolov8x-obb.pt',  # run 4
        'yolov8n-obb.pt',  # run 5
        'yolov8m-obb.pt',  # run 6
        'yolov8l-obb.pt',  # run 7
        'yolov8x-obb.pt',  # run 8
        'yolov8n-obb.pt',  # run 9
        'yolov8m-obb.pt'  # run 10
    ]

    # epochs_list = [50, 100, 150, 200, 100, 150, 200, 150, 100, 200]
    epochs_list = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    batch_list = [8, 8, 16, 16, 8, 16, 8, 16, 8, 16]
    imgsz_list = [640, 640, 640, 640, 960, 960, 960, 960, 1280, 1280]
    lr0_list = [0.001, 0.0015, 0.001, 0.002, 0.0015, 0.001, 0.002, 0.0015, 0.0005, 0.002]


    device = "cpu"  # GPU: 0, CPU: 'cpu'
    base_workers = 4

    # Folder na wyniki wszystkich treningów
    all_runs_dir = os.path.join(script_dir, 'yolo_training_runs')
    os.makedirs(all_runs_dir, exist_ok=True)

    # Ścieżka do pliku CSV z metrykami
    csv_metrics_path = os.path.join(all_runs_dir, 'training_metrics.csv')

    for run in range(1, num_runs + 1):
        print(f"\n=== Rozpoczynanie treningu nr {run} ===")

        # Unikalny folder dla bieżącego treningu
        run_dir = os.path.join(all_runs_dir, f'run_{run}')
        os.makedirs(run_dir, exist_ok=True)

        # Utworzenie folderu tymczasowego dla bieżącego treningu
        temp_dir = os.path.join(run_dir, 'yolo_data_tmp')
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)

        try:
            # Tworzenie struktury YOLO
            create_temp_yolo_structure(original_images_dir, original_labels_dir, temp_dir)

            # Generowanie pliku data.yaml
            data_yaml_path = os.path.join(temp_dir, 'data.yaml')
            generate_data_yaml(temp_dir, data_yaml_path, nc, classes)

            # Pobranie parametrów dla bieżącego runu
            epochs = epochs_list[run - 1]
            batch = batch_list[run - 1]
            imgsz = imgsz_list[run - 1]
            lr0 = lr0_list[run - 1]

            # Nazwa unikalna dla bieżącego treningu
            run_name = f"yolov8_obb_train_run_{run}"

            # Uruchomienie treningu
            save_dir, results = train_yolov8_obb(
                data_yaml=data_yaml_path,
                weights=os.path.join('models', models[run-1]),
                epochs=epochs,
                batch=batch,
                imgsz=imgsz,
                device=device,
                name=run_name,
                workers=base_workers,
                lr0=lr0
            )

            # Przeniesienie wyników do folderu bieżącego run
            final_run_dir = os.path.join(run_dir, 'results')
            shutil.move(save_dir, final_run_dir)

            # Zapisanie metryk do pliku CSV
            metrics = results.metrics
            best_model_path = os.path.join(final_run_dir, 'best.pt')
            save_metrics_to_csv(csv_metrics_path, run, metrics, best_model_path)

        except Exception as e:
            print(f"Wystąpił błąd podczas treningu nr {run}: {e}")
        finally:
            # Usunięcie folderu tymczasowego
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

    print("\n=== Wszystkie treningi zakończone ===")


if __name__ == "__main__":
    main()
