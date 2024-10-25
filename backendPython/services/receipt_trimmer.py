import cv2
import numpy as np
import matplotlib.pyplot as plt

from config import (BLUR_KERNEL_SIZE, MORPH_KERNEL_SIZE, MORPH_ITERATIONS, DILATION_ITERATIONS,
                    EROSION_ITERATIONS, EPSILON_FACTOR)


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
    pts = contour.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")

    # Sumowanie i różnica współrzędnych do znalezienia narożników
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # Lewy górny
    rect[2] = pts[np.argmax(s)]  # Prawy dolny

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # Prawy górny
    rect[3] = pts[np.argmax(diff)]  # Lewy dolny

    widthA = np.linalg.norm(rect[2] - rect[3])
    widthB = np.linalg.norm(rect[1] - rect[0])
    maxWidth = max(int(widthA), int(widthB))

    heightA = np.linalg.norm(rect[1] - rect[2])
    heightB = np.linalg.norm(rect[0] - rect[3])
    maxHeight = max(int(heightA), int(heightB))

    # Nowe punkty docelowe do przekształcenia perspektywy
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")

    # Macierz transformacji perspektywy
    M = cv2.getPerspectiveTransform(rect, dst)

    # Przekształcenie perspektywy z wypełnieniem białym kolorem
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight), borderValue=border_color)

    # Konwersja do przestrzeni RGB dla Matplotlib
    warped_rgb = cv2.cvtColor(warped, cv2.COLOR_BGR2RGB)
    return warped_rgb


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
        print(f"Obraz został przeskalowany z ({width}x{height}) do ({new_width}x{new_height})")
        return resized_image
    return image


def draw_pics(edged, processed, output, warped, prepared_image):
    """
    Rysuje i wyświetla obrazy za pomocą Matplotlib.
    """

    # Tytuły do wyświetlenia
    display_titles = [
        'Krawędzie Canny',
        'Operacje morfologiczne',
        'Kontur paragonu',
        'Wyprostowany paragon',
        'Obraz do OCR'
    ]

    fig, axs = plt.subplots(2, 3, figsize=(22, 12))

    axs[0,0].imshow(edged, cmap='gray')
    axs[0,0].set_title(display_titles[0])
    axs[0,0].axis('off')

    axs[0,1].imshow(processed, cmap='gray')
    axs[0,1].set_title(display_titles[1])
    axs[0,1].axis('off')

    axs[0,2].imshow(output)
    axs[0,2].set_title(display_titles[2])
    axs[0,2].axis('off')

    axs[1,0].imshow(warped)
    axs[1,0].set_title(display_titles[3])
    axs[1,0].axis('off')

    axs[1,1].imshow(prepared_image, cmap='gray')
    axs[1,1].set_title(display_titles[4])
    axs[1,1].axis('off')

    plt.tight_layout()
    plt.show()


def trim_receipt(image):

    # Przetwarzanie obrazu
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    gray = convert_to_grayscale(image)

    blurred = apply_gaussian_blur(gray, BLUR_KERNEL_SIZE)
    edged = detect_edges(blurred)

    # Operacje morfologiczne
    closed = morph_operations(edged, MORPH_KERNEL_SIZE, morph_type=cv2.MORPH_CLOSE, iterations=MORPH_ITERATIONS)
    dilated = morph_operations(closed, MORPH_KERNEL_SIZE, morph_type=cv2.MORPH_DILATE, iterations=DILATION_ITERATIONS)
    eroded = morph_operations(dilated, MORPH_KERNEL_SIZE, morph_type=cv2.MORPH_ERODE, iterations=EROSION_ITERATIONS)
    processed = eroded

    # Znajdowanie konturu paragonu
    receipt_contour = find_receipt_contour(processed, EPSILON_FACTOR)
    if receipt_contour is None:
        print("Nie znaleziono konturu paragonu.")
        return

    # Rysowanie konturów na kopii obrazu
    output = image_rgb.copy()
    cv2.drawContours(output, [receipt_contour], -1, (0, 255, 0), 20)

    # Przekształcenie perspektywy
    warped = perform_perspective_transform(image, receipt_contour)

    # Przygotowanie obrazu do OCR
    prepared_image = prepare_for_ocr(warped)

    resized_image = resize_if_needed(prepared_image)

    #draw_pics(edged, processed, output, warped, prepared_image)

    return resized_image

# import os
# folder_path = r'C:\Users\matim\Desktop\Paragony-20241025T224554Z-001\Paragony'
# counter = 0
# for filename in os.listdir(folder_path):
#     if filename.endswith('.jpg') :  # Dopasuj do formatów obrazu
#         file_path = os.path.join(folder_path, filename)
#
#         # Wczytaj obraz
#         image = cv2.imread(file_path)
#         counter = counter + 1
#         # Jeśli obraz został poprawnie wczytany, zastosuj losowy filtr
#         if image is not None :
#
#             processed_image = trim_receipt(image)
#             # Zapisz przetworzony obraz pod tą samą nazwą
#             cv2.imwrite(file_path, processed_image)


# img = load_image(r'C:\Users\matim\Desktop\Paragony-20241025T224554Z-001\Paragony\29.78.jpg')
# print(type(trim_receipt(img)))