import random
import os

from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
import cv2
import numpy as np

from ultralytics import YOLO

from cnnTrimChecker.cnn_service.cnn_predict import load_cnn_model
from services.bert_predict import load_model_and_tokenizer, predict_top_k

from config import BERT_MODEL_NAME, YOLO_PATH, EXAMPLE_RECEIPTS_PATH
from services.image_ocr import predict_image
from services.receipt_trimmer import perform_trimming

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    """
    Przyjmuje:
    - file: UploadFile - Plik obrazu przesłany przez użytkownika.

    Zwraca:
    - JSON:
        {
            "ocr_data": dict lub None - Wyniki OCR,
            "yolo_image": bytes lub None - Obraz przetworzony przez YOLO,
            "trimmed_image": bytes lub None - Obraz przycięty.
        }
    - HTTPException: W przypadku błędu odpowiedni kod statusu i komunikat.
    """
    try:
        image_stream = await file.read()
        np_arr = np.frombuffer(image_stream, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        trimmed_image, flag = perform_trimming(image, trim_sequence["combination_list"], cnn_model)

        if flag:
            ocr_data, yolo_image = predict_image(trimmed_image, yolo_model)

            _, yolo_buffer = cv2.imencode('.jpg', yolo_image)
            _, trimmed_buffer = cv2.imencode('.jpg', trimmed_image)

            return {
                "ocr_data": ocr_data,
                "yolo_image": yolo_buffer.tobytes(),
                "trimmed_image": trimmed_buffer.tobytes()
            }
        else:
            _, original_buffer = cv2.imencode('.jpg', image)
            return {
                "ocr_data": None,
                "yolo_image": None,
                "trimmed_image": original_buffer.tobytes()
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.get("/fast-api/random-images")
async def get_random_images(count: int = Query(default=3, ge=1, le=5)):
    """
    Przyjmuje:
    - count: int (Query) - Liczba zdjęć do wylosowania. Wartość musi być w zakresie od 1 do 5.

    Zwraca:
    - JSON:
      {
        "selected_images": list[bytes] - Lista obrazów w formacie bajtów (zakodowane jako .jpg).
      }
    - HTTPException: W przypadku błędu odpowiedni kod statusu i komunikat.
    """
    try:
        all_images = [os.path.join(EXAMPLE_RECEIPTS_PATH, f) for f in os.listdir(EXAMPLE_RECEIPTS_PATH) if
                      f.lower().endswith(('png', 'jpg', 'jpeg'))]

        if not all_images:
            raise HTTPException(status_code=404, detail="No images found in the specified path")

        selected_images_paths = random.sample(all_images, min(count, len(all_images)))

        encoded_images = []
        for image_path in selected_images_paths:
            image = cv2.imread(image_path)
            if image is None:
                raise HTTPException(status_code=500, detail=f"Failed to read image at {image_path}")
            _, buffer = cv2.imencode('.jpg', image)
            encoded_images.append(buffer.tobytes())

        return {"selected_images": encoded_images}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid number of images to sample: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while selecting images: {str(e)}")
