import shutil
import os

from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
from io import BytesIO

from services.bert_predict import load_model_and_tokenizer, predict_top_k

from config import TEMP_PATH, BERT_MODEL_NAME
from services.image_ocr import image_ocr
from services.receipt_trimmer import trim_receipt

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

model = None
tokenizer = None
label_encoder = None


class CategoryRequest(BaseModel):
    title: str
    k: int


@app.on_event("startup")
async def startup_event():
    global model, tokenizer, label_encoder
    model, tokenizer, label_encoder = load_model_and_tokenizer(BERT_MODEL_NAME)


@app.post("/fast-api/get-category")
async def get_category(data: CategoryRequest):
    """
    :param:
    {
      "title": "",
      "k":
    }
    :return:
    {
      "category_1": {
        "category": "",
        "score":
      }
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


@app.post("/fast-api/getimagetext")
async def get_image_text(file: UploadFile = File(...)):
    """
    :param file: UploadFile, an image of a receipt
    :return:
    {
      "title": "",
      "total_amount": "",
      "shop": "",
      "content": ""
    }
    """
    file_location = os.path.join(TEMP_PATH, file.filename)
    os.makedirs(TEMP_PATH, exist_ok=True)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    receipt_data = image_ocr(file_location)

    response = {
        "title": receipt_data["title"],
        "total_amount": receipt_data["total_amount"],
        "shop": receipt_data["shop"],
        "content": receipt_data["content"]
    }
    os.remove(file_location)

    return response


@app.post("/fast-api/trim-receipt")
async def process_receipt(file: UploadFile = File(...)):
    try:
        image_stream = await file.read()
        np_arr = np.frombuffer(image_stream, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        trimmed_image = trim_receipt(image)

        _, buffer = cv2.imencode('.jpg', trimmed_image)

        return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")