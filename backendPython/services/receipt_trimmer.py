import cv2
import numpy as np
from cnnTrimChecker.cnn_service.cnn_predict import check_trimmed_image, load_cnn_model
from config import CNN_MODEL_NAME

def load_image(image_path):
    """
    Wczytuje obraz z podanej ścieżki.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Nie można wczytać obrazu: {image_path}")
    return image

def convert_to_grayscale(image):
    """
    Konwertuje obraz do skali szarości.
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def apply_gaussian_blur(gray, kernel_size):
    """
    Nakłada rozmycie Gaussa na obraz.
    """
    return cv2.GaussianBlur(gray, kernel_size, 0)

def detect_edges(blurred):
    """
    Wykrywa krawędzie za pomocą metody Canny'ego.
    """
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return cv2.Canny(thresh, 0, 255)

def morph_operations(edged, kernel_size, morph_type=cv2.MORPH_CLOSE, iterations=1):
    """
    Stosuje operacje morfologiczne na obrazie.
    """
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, kernel_size)
    return cv2.morphologyEx(edged, morph_type, kernel, iterations=iterations)

def find_receipt_contour(processed, epsilon_factor):
    """
    Znajduje kontur paragonu jako największy czworokątny kontur.
    """
    contours, _ = cv2.findContours(processed.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for contour in contours:
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon_factor * peri, True)
        if len(approx) == 4:
            return approx
    return None

def perform_perspective_transform(image, contour, border_color=(255, 255, 255)):
    """
    Przeprowadza transformację perspektywy na podstawie podanego konturu.
    """
    try:
        # Upewnij się, że kontur ma odpowiedni kształt (4, 2)
        pts = contour.reshape(4, 2)

        # Posortowanie punktów według współrzędnych x (lewe i prawe)
        pts = sorted(pts, key=lambda x: x[0])

        # Zidentyfikowanie lewych i prawych punktów
        left_points = pts[:2]
        right_points = pts[2:]

        # Posortowanie lewych i prawych punktów według współrzędnych y (górne i dolne)
        left_points = sorted(left_points, key=lambda x: x[1])
        right_points = sorted(right_points, key=lambda x: x[1])

        # Ustawienie punktów w odpowiedniej kolejności
        rect = np.array([left_points[0], right_points[0], right_points[1], left_points[1]], dtype="float32")

        # Obliczanie szerokości i wysokości prostokąta
        widthA = np.linalg.norm(rect[2] - rect[3])
        widthB = np.linalg.norm(rect[1] - rect[0])
        maxWidth = max(int(widthA), int(widthB))

        heightA = np.linalg.norm(rect[1] - rect[2])
        heightB = np.linalg.norm(rect[0] - rect[3])
        maxHeight = max(int(heightA), int(heightB))

        # Sprawdzenie poprawności wymiarów
        if maxWidth <= 0 or maxHeight <= 0:
            raise ValueError("Nieprawidłowe wymiary obrazu: szerokość lub wysokość jest <= 0")

        # Definiowanie macierzy punktów docelowych do przekształcenia
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]], dtype="float32")

        # Obliczanie macierzy transformacji perspektywy
        M = cv2.getPerspectiveTransform(rect, dst)

        # Przeprowadzenie transformacji perspektywy
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight), borderValue=border_color)

        # Konwersja do przestrzeni RGB dla Matplotlib
        warped_rgb = cv2.cvtColor(warped, cv2.COLOR_BGR2RGB)
        return warped_rgb

    except Exception as e:
        #print("Błąd w perform_perspective_transform:", str(e))
        return None

def prepare_for_ocr(image):
    """
    Przygotowuje obraz do OCR poprzez zastosowanie odpowiednich przekształceń.
    """
    # Konwersja do skali szarości (jeśli nie jest)
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # Zdefiniowanie jądra (kernela) wyostrzającego
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])

    # Zastosowanie filtra konwolucyjnego do wyostrzenia
    sharpened_image = cv2.filter2D(gray, -1, kernel)

    return sharpened_image

def resize_if_needed(image, max_pixels=2073600):
    """
    Przeskalowuje obraz, jeśli liczba pikseli przekracza max_pixels, zachowując proporcje.

    :param image: Obraz do przeskalowania.
    :param max_pixels: Maksymalna liczba pikseli.
    :return: Przeskalowany lub oryginalny obraz.
    """
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

def trim_receipt(image, cnn_model, blur_kernel_size, morph_kernel_size, morph_iterations, epsilon_factor, dilation_iterations, erosion_iterations):
    # Przetwarzanie obrazu
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    gray = convert_to_grayscale(image)

    blurred = apply_gaussian_blur(gray, blur_kernel_size)
    edged = detect_edges(blurred)

    # Operacje morfologiczne
    closed = morph_operations(edged, morph_kernel_size, morph_type=cv2.MORPH_CLOSE, iterations=morph_iterations)
    dilated = morph_operations(closed, morph_kernel_size, morph_type=cv2.MORPH_DILATE, iterations=dilation_iterations)
    eroded = morph_operations(dilated, morph_kernel_size, morph_type=cv2.MORPH_ERODE, iterations=erosion_iterations)
    processed = eroded

    # Znajdowanie konturu paragonu
    receipt_contour = find_receipt_contour(processed, epsilon_factor)
    if receipt_contour is None:
        #print("Nie znaleziono konturu paragonu.")
        return None

    # Przekształcenie perspektywy
    warped = perform_perspective_transform(image, receipt_contour)
    if warped is None:
        return None

    # Przygotowanie obrazu do OCR
    prepared_image = prepare_for_ocr(warped)
    resized_image = resize_if_needed(prepared_image)

    result = None
    for i in range(3):
        classification = check_trimmed_image(resized_image, cnn_model)
        if classification == 'rotated':
            resized_image = rotate(resized_image)
        else:
            result = classification
            break
    return result

import cv2
import os
import itertools

input_path = r'C:\Users\matim\Desktop\chuj'
output_path = r'C:\Users\matim\Desktop\paragony_trimmed'
cnn_model = load_cnn_model(CNN_MODEL_NAME)

# Definicja list możliwych wartości parametrów
blur_kernel_sizes = [(3,3), (5,5), (7,7), (9,9), (11,11)]
morph_kernel_sizes = [(3,3), (5,5), (7,7), (9,9), (11,11)]
morph_iterations_list = [1, 2, 3]
epsilon_factors = [0.01, 0.02, 0.03, 0.04, 0.05]
dilation_iterations_list = [1, 2, 3]
erosion_iterations_list = [1, 2, 3]

# Generowanie wszystkich kombinacji parametrów
parameter_combinations = list(itertools.product(
    blur_kernel_sizes,
    morph_kernel_sizes,
    morph_iterations_list,
    epsilon_factors,
    dilation_iterations_list,
    erosion_iterations_list
))

# Słownik do przechowywania liczby sukcesów dla każdej kombinacji
combination_success_counts = {}

if not os.path.exists(output_path):
    os.makedirs(output_path)

# Przetwarzanie obrazów
for filename in os.listdir(input_path):
    if filename.endswith('.jpg'):
        file_path = os.path.join(input_path, filename)

        image = cv2.imread(file_path)
        if image is not None:
            for combination in parameter_combinations:
                blur_kernel_size = combination[0]
                morph_kernel_size = combination[1]
                morph_iterations = combination[2]
                epsilon_factor = combination[3]
                dilation_iterations = combination[4]
                erosion_iterations = combination[5]

                result = trim_receipt(
                    image,
                    cnn_model,
                    blur_kernel_size,
                    morph_kernel_size,
                    morph_iterations,
                    epsilon_factor,
                    dilation_iterations,
                    erosion_iterations
                )

                if result == 'positive':
                    combination_key = combination
                    if combination_key in combination_success_counts:
                        combination_success_counts[combination_key] += 1
                    else:
                        combination_success_counts[combination_key] = 1


sorted_combinations = sorted(combination_success_counts.items(), key=lambda x: x[1], reverse=True)

# Zapisanie rankingu do pliku tekstowego
ranking_file = os.path.join(output_path, 'combination_ranking.txt')
with open(ranking_file, 'w') as f:
    for combo, count in sorted_combinations:
        f.write(f"Kombinacja: {combo}, Sukcesy: {count}\n")
