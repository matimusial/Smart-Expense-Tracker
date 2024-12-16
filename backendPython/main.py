import base64

import numpy as np
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, HTTPException, UploadFile
import cv2
import pytesseract

from ultralytics import YOLO

from cnnTrimChecker.cnn_service.cnn_predict import load_cnn_model
from services.bert_predict import load_model_and_tokenizer, predict_top_k

from config import BERT_MODEL_NAME, YOLO_PATH, OTHER_SERVICES_ADRESSES, PYTESSERACT_PATH
from services.image_ocr import predict_image
from services.receipt_trimmer import perform_trimming

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=OTHER_SERVICES_ADRESSES,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from cnnTrimChecker.cnn_config import SEQUENCE_1
trim_sequence = SEQUENCE_1

model = None
tokenizer = None
label_encoder = None
cnn_model = None
yolo_model = None


class CategoryRequest(BaseModel):
    title: str
    k: int


@app.on_event("startup")
async def startup_event():
    global model, tokenizer, label_encoder, cnn_model, trim_sequence, yolo_model
    model, tokenizer, label_encoder = load_model_and_tokenizer(BERT_MODEL_NAME)
    cnn_model = load_cnn_model(trim_sequence["model_name"])
    yolo_model = YOLO(YOLO_PATH)
    pytesseract.pytesseract.tesseract_cmd = PYTESSERACT_PATH


@app.post("/fast-api/get-category")
async def get_category(data: CategoryRequest):
    """
    Przyjmuje:
    {
      "title": str - Tytuł tekstu, na podstawie którego będą przewidywane kategorie,
      "k": int - Liczba najlepszych kategorii do zwrócenia.
    }
    Zwraca:
    {
      "category_1": {
        "category": str - Nazwa kategorii,
        "score": float - Prawdopodobieństwo przewidzianej kategorii.
      },
      ...
    }
    """
    title = data.title
    k = data.k

    predicted_categories = predict_top_k(title, model, tokenizer, label_encoder, k=k)

    response = {}
    for i, (category, score) in enumerate(predicted_categories, 1):
        response[f"category_{i}"] = {
            "category": category,
            "score": float(score)
        }

    return response


@app.post("/fast-api/perform-ocr")
async def process_receipt(file: UploadFile = File(...)):
    try:
        file_bytes = np.asarray(bytearray(await file.read()), dtype=np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        if len(image.shape) == 2 or (len(image.shape) == 3 and image.shape[2] == 1):
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

        if len(image.shape) == 3 and image.shape[2] != 3:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2BGR if image.shape[2] == 4 else cv2.COLOR_BGRA2BGR)

        trimmed_image, flag = perform_trimming(image, trim_sequence["combination_list"], cnn_model)

        if flag:

            ocr_data, yolo_image = predict_image(trimmed_image, yolo_model)

            _, yolo_buffer = cv2.imencode('.jpg', yolo_image)
            _, trimmed_buffer = cv2.imencode('.jpg', trimmed_image)

            yolo_base64 = base64.b64encode(yolo_buffer).decode('utf-8')
            trimmed_base64 = base64.b64encode(trimmed_buffer).decode('utf-8')
            return {
                "ocr_data": ocr_data,
                "yolo_image": yolo_base64,
                "trimmed_image": trimmed_base64
            }
        else:
            _, original_buffer = cv2.imencode('.jpg', image)
            original_base64 = base64.b64encode(original_buffer).decode('utf-8')
            return {
                "ocr_data": None,
                "yolo_image": None,
                "trimmed_image": original_base64
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

