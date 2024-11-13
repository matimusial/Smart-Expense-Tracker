import os

import cv2
import numpy as np
from matplotlib import pyplot as plt

from cnnTrimChecker.cnn_service.cnn_predict import check_trimmed_image, load_cnn_model


def convert_to_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def apply_gaussian_blur(gray, kernel_size):
    return cv2.GaussianBlur(gray, kernel_size, 0)


def detect_edges(blurred):
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return cv2.Canny(thresh, 0, 255)


def morph_operations(edged, kernel_size, morph_type=cv2.MORPH_CLOSE, iterations=1):
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, kernel_size)
    return cv2.morphologyEx(edged, morph_type, kernel, iterations=iterations)


def find_receipt_contour(processed, epsilon_factor):
    contours, _ = cv2.findContours(processed.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for contour in contours:
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon_factor * peri, True)
        if len(approx) == 4:
            return approx
    return None


def perform_perspective_transform(image, contour, border_color=(255, 255, 255)):
    try:
        pts = contour.reshape(4, 2)

        pts = sorted(pts, key=lambda x: x[0])

        left_points = pts[:2]
        right_points = pts[2:]

        left_points = sorted(left_points, key=lambda x: x[1])
        right_points = sorted(right_points, key=lambda x: x[1])

        rect = np.array([left_points[0], right_points[0], right_points[1], left_points[1]], dtype="float32")

        widthA = np.linalg.norm(rect[2] - rect[3])
        widthB = np.linalg.norm(rect[1] - rect[0])
        maxWidth = max(int(widthA), int(widthB))

        heightA = np.linalg.norm(rect[1] - rect[2])
        heightB = np.linalg.norm(rect[0] - rect[3])
        maxHeight = max(int(heightA), int(heightB))

        if maxWidth <= 0 or maxHeight <= 0:
            return None

        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]], dtype="float32")
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight), borderValue=border_color)
        return cv2.cvtColor(warped, cv2.COLOR_BGR2RGB)
    except Exception as e:
        return None


def prepare_for_ocr(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    return cv2.filter2D(gray, -1, kernel)


def resize_if_needed(image, max_pixels=2073600):
    height, width = image.shape[:2]
    total_pixels = height * width
    if total_pixels > max_pixels:
        scale = (max_pixels / total_pixels) ** 0.5
        new_width = int(width * scale)
        new_height = int(height * scale)
        resized_image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        return resized_image
    return image


def rotate(image):
    return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)


def trim_receipt(image, cnn_model, blur_kernel_size, morph_kernel_size, morph_iterations, epsilon_factor,
                 dilation_iterations, erosion_iterations):

    gray = convert_to_grayscale(image)

    blurred = apply_gaussian_blur(gray, blur_kernel_size)
    edged = detect_edges(blurred)

    closed = morph_operations(edged, morph_kernel_size, morph_type=cv2.MORPH_CLOSE, iterations=morph_iterations)
    dilated = morph_operations(closed, morph_kernel_size, morph_type=cv2.MORPH_DILATE, iterations=dilation_iterations)
    eroded = morph_operations(dilated, morph_kernel_size, morph_type=cv2.MORPH_ERODE, iterations=erosion_iterations)
    processed = eroded

    receipt_contour = find_receipt_contour(processed, epsilon_factor)
    if receipt_contour is None:
        return None, None

    warped = perform_perspective_transform(image, receipt_contour)
    if warped is None:
        return None, None

    prepared_image = prepare_for_ocr(warped)
    resized_image = resize_if_needed(prepared_image)

    result = None
    for i in range(4):
        classification = check_trimmed_image(resized_image, cnn_model)
        if classification == 'rotated':
            resized_image = rotate(resized_image)
        else:
            result = classification
            break
    return result, resized_image


def load_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found: {image_path}")
    return image


def perform_trimming(image, combinations, cnn_model):

    original_image = image.copy()

    for index, combination in enumerate(combinations):
        result, resized_image = trim_receipt(image, cnn_model, *combination)
        if result == "positive":
            return resized_image, True
    return original_image, False


# from cnnTrimChecker.cnn_config import SEQUENCE_1
# model = load_cnn_model(SEQUENCE_1["model_name"])
# path = r"C:\Users\matim\Desktop\wqe\20241104_142644.jpg"
# img = cv2.imread(path)
# processed_image, _ = perform_trimming(img, SEQUENCE_1["combination_list"], model)
# plt.imshow(processed_image, cmap="gray")
# plt.show()
#
# input_folder = r"C:\Users\matim\Desktop\Paragony_ALL"
# output_folder = r"C:\Users\matim\Desktop\toyolo"
#
# if not os.path.exists(output_folder):
#     os.makedirs(output_folder)
#
# # Iteruj przez wszystkie pliki w folderze wejściowym
# for filename in os.listdir(input_folder):
#     if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
#         # Załaduj obraz używając cv2
#         image_path = os.path.join(input_folder, filename)
#         image = cv2.imread(image_path)
#
#         # Przetwórz obraz funkcją perform_trimming
#         processed_image, flag = perform_trimming(image, SEQUENCE_1["combination_list"], model)
#         if flag:
#             # Zapisz wynik w folderze wyjściowym
#             output_path = os.path.join(output_folder, filename)
#             cv2.imwrite(output_path, processed_image)
            # print(f"Zapisano przetworzony obraz: {output_path}")