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
        # List of attributes to process
        for attr_name in ['boxes', 'obb']:
            detections = getattr(result, attr_name, None)
            if detections is not None:
                if len(detections) > 0:
                    for det in detections:
                        class_id = int(det.cls.item()) if det.cls is not None else None
                        confidence = det.conf.item() if det.conf is not None else 0.0

                        if class_id is None:
                            continue

                        # Update the best detection for the given class
                        if (class_id not in best_detections) or (confidence > best_detections[class_id]['conf']):
                            best_detections[class_id] = {
                                attr_name: det,
                                'conf': confidence
                            }
                    # After processing detections for one attribute, move to the next result
                    break
                else:
                    print(f"  No object detections above the confidence threshold in '{attr_name}'.")
        else:
            # If neither 'boxes' nor 'obb' contain detections
            print("  No object detections above the confidence threshold (neither 'boxes' nor 'obb').")
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
