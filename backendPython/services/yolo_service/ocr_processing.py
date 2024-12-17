import cv2
import numpy as np
from PIL import Image


def adjust_gamma(image, gamma):
    inv_gamma = 1.0 / gamma
    table = np.array([(i / 255.0) ** inv_gamma * 255 for i in np.arange(256)]).astype("uint8")
    return cv2.LUT(image, table)


def clean_background_function(img, ksize):
    background = cv2.medianBlur(img, ksize)
    return cv2.absdiff(img, background)


def clean_background_gaussian(img, ksize):
    background = cv2.GaussianBlur(img, ksize, 0)
    return cv2.absdiff(img, background)


def resize_image_to_dpi(img, target_dpi=300):
    original_dpi = 96
    scale_factor = target_dpi / original_dpi
    width = int(img.shape[1] * scale_factor)
    height = int(img.shape[0] * scale_factor)
    resized = cv2.resize(img, (width, height), interpolation=cv2.INTER_CUBIC)
    return resized


def process_pil(image):
    from yoloTrainer.yolo_config import OCR_PROCESSING_CONFIGURATION
    clean_background = OCR_PROCESSING_CONFIGURATION.get('clean_background')
    if clean_background is None:
        raise ValueError("clean_background cannot be None")

    clean_bg_function_ksize = OCR_PROCESSING_CONFIGURATION.get('clean_bg_function_ksize')
    clean_bg_gaussian_ksize = OCR_PROCESSING_CONFIGURATION.get('clean_bg_gaussian_ksize')

    denoise = OCR_PROCESSING_CONFIGURATION.get('denoise')

    median_kernel = OCR_PROCESSING_CONFIGURATION.get('median_kernel')
    bilateral_params = OCR_PROCESSING_CONFIGURATION.get('bilateral_params')

    enhance_contrast = OCR_PROCESSING_CONFIGURATION.get('enhance_contrast')
    clahe_params = OCR_PROCESSING_CONFIGURATION.get('clahe_params')
    gamma = OCR_PROCESSING_CONFIGURATION.get('gamma')

    adaptive_threshold = OCR_PROCESSING_CONFIGURATION.get('adaptive_threshold')
    adaptive_block_size = OCR_PROCESSING_CONFIGURATION.get('adaptive_block_size')
    adaptive_c = OCR_PROCESSING_CONFIGURATION.get('adaptive_c')
    morphological_operation = OCR_PROCESSING_CONFIGURATION.get('morphological_operation')
    close_kernel = OCR_PROCESSING_CONFIGURATION.get('close_kernel')
    open_kernel = OCR_PROCESSING_CONFIGURATION.get('open_kernel')
    erode_kernel = OCR_PROCESSING_CONFIGURATION.get('erode_kernel')
    dilate_kernel = OCR_PROCESSING_CONFIGURATION.get('dilate_kernel')

    img = np.array(image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img = resize_image_to_dpi(img)

    if clean_background == 'function':
        img = clean_background_function(img, ksize=clean_bg_function_ksize)
    elif clean_background == 'gaussian':
        img = clean_background_gaussian(img, ksize=clean_bg_gaussian_ksize)

    if denoise == 'median':
        img = cv2.medianBlur(img, median_kernel)
    elif denoise == 'bilateral':
        d, sc, ss = bilateral_params
        img = cv2.bilateralFilter(img, d, sc, ss)

    if enhance_contrast == 'equalize':
        img = cv2.equalizeHist(img)
    elif enhance_contrast == 'clahe':
        clipLimit, tileGridSize = clahe_params
        clahe = cv2.createCLAHE(clipLimit=clipLimit, tileGridSize=tileGridSize)
        img = clahe.apply(img)

    if gamma:
        img = adjust_gamma(img, gamma=gamma)

    close_kernel_element = cv2.getStructuringElement(cv2.MORPH_RECT, close_kernel) if close_kernel else None
    open_kernel_element = cv2.getStructuringElement(cv2.MORPH_RECT, open_kernel) if open_kernel else None
    erode_kernel_element = cv2.getStructuringElement(cv2.MORPH_RECT, erode_kernel) if erode_kernel else None
    dilate_kernel_element = cv2.getStructuringElement(cv2.MORPH_RECT, dilate_kernel) if dilate_kernel else None

    if adaptive_threshold == 'gaussian':
        img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,
                                    adaptive_block_size, adaptive_c)
    elif adaptive_threshold == 'otsu':
        img = cv2.GaussianBlur(img, (5, 5), 0)
        _, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    if morphological_operation == "closedilate":
        if close_kernel_element is not None and dilate_kernel_element is not None:
            img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, close_kernel_element, iterations=1)
            img = cv2.dilate(img, dilate_kernel_element, iterations=1)

    elif morphological_operation == "openclose":
        if open_kernel_element is not None and close_kernel_element is not None:
            img = cv2.morphologyEx(img, cv2.MORPH_OPEN, open_kernel_element, iterations=1)
            img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, close_kernel_element, iterations=1)

    elif morphological_operation == "closeerode":
        if close_kernel_element is not None and erode_kernel_element is not None:
            img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, close_kernel_element, iterations=1)
            img = cv2.erode(img, erode_kernel_element, iterations=1)

    img = cv2.copyMakeBorder(img, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=255)

    return Image.fromarray(img)
