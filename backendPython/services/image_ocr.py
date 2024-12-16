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
