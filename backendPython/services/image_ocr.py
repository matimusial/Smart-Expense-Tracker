from matplotlib import pyplot as plt
from ultralytics import YOLO
import cv2

from services.yolo_service.ocr import perform_ocr_on_detections
from services.yolo_service.yolo import predict, get_best_detections, draw_polygons


def load_model(model_path):
    return YOLO(model_path)


def load_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Nie można załadować obrazu ze ścieżki: {image_path}")
    return image


def predict_image(image, model):
    results = predict(model, image)
    annotated_image = image.copy()
    best_detections = get_best_detections(results)

    if not best_detections:
        return None, None

    draw_polygons(annotated_image, best_detections)
    ocr_results = perform_ocr_on_detections(image, best_detections)
    return ocr_results, annotated_image


if __name__ == "__main__":
    MODEL_PATH = r"C:\Users\matim\Desktop\Smart-Expense-Tracker\backendPython\yoloTrainer\yolo_training_runs\run_6_200_16_0.0015_yolov8m-obb.pt\weights\best.pt"
    IMAGE_PATH = r"C:\Users\matim\Desktop\Smart-Expense-Tracker\backendPython\yoloTrainer\yolo_data\images\20241030_002054.jpg"
    model = load_model(MODEL_PATH)
    image = load_image(IMAGE_PATH)
    ocr_data, yolo_image = predict_image(image, model)

    if ocr_data:
        for class_name, text in ocr_data.items():
            print(f"{class_name}: {text}")

    if yolo_image is not None:
        plt.imshow(yolo_image)
        plt.show()
