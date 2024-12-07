import cv2
import numpy as np
from yoloTrainer.yolo_config import CONF_THRESHOLD


def predict(model, image):
    results = model.predict(
        source=image,
        conf=CONF_THRESHOLD,
        save=False,
        show=False,
        verbose=False
    )
    return results


def get_best_detections(results):
    best_detections = {}
    for result in results:
        if hasattr(result, 'boxes') and result.boxes is not None:
            boxes = result.boxes
            if len(boxes) > 0:
                for box in boxes:
                    class_id = int(box.cls.item()) if box.cls is not None else None
                    confidence = box.conf.item() if box.conf is not None else 0.0
                    if class_id is None:
                        continue
                    if class_id not in best_detections or confidence > best_detections[class_id]['conf']:
                        best_detections[class_id] = {
                            'box': box,
                            'conf': confidence
                        }
            else:
                print("  Brak detekcji obiektów powyżej progu pewności w 'boxes'.")
        elif hasattr(result, 'obb') and result.obb is not None:
            obbs = result.obb
            if len(obbs) > 0:
                for obb in obbs:
                    class_id = int(obb.cls.item()) if obb.cls is not None else None
                    confidence = obb.conf.item() if obb.conf is not None else 0.0
                    if class_id is None:
                        continue
                    if class_id not in best_detections or confidence > best_detections[class_id]['conf']:
                        best_detections[class_id] = {
                            'obb': obb,
                            'conf': confidence
                        }
            else:
                print("  Brak detekcji obiektów powyżej progu pewności w 'obb'.")
        else:
            print("  'boxes' lub 'obb' są None lub brak detekcji obiektów.")
    return best_detections


def draw_polygons(image, detections):
    for class_id, detection in detections.items():
        if 'boxes' in detection:
            box = detection['box']
            x1, y1, x2, y2 = box.xyxy.tolist()[0]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            cv2.rectangle(image, (x1, y1), (x2, y2), color=(0, 0, 255), thickness=2)
        elif 'obb' in detection:
            obb = detection['obb']
            coords = obb.xyxyxyxy.tolist()[0] if hasattr(obb.xyxyxyxy, 'tolist') else list(obb.xyxyxyxy)
            points = [tuple(point) for point in coords]
            pts = np.array(points, np.int32).reshape((-1, 1, 2))
            cv2.polylines(image, [pts], isClosed=True, color=(0, 0, 255), thickness=2)
