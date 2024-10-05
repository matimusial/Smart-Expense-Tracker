from fastapi import FastAPI
from pydantic import BaseModel
from services.bert_predict import load_model_and_tokenizer, predict_top_k

app = FastAPI()

model = None
tokenizer = None
label_encoder = None


class CategoryRequest(BaseModel):
    title: str
    k: int


@app.on_event("startup")
async def startup_event():
    global model, tokenizer, label_encoder
    model, tokenizer, label_encoder = load_model_and_tokenizer(accuracy="0.9228")


@app.post("/getcategory")
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

