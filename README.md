# Smart Expense Tracker - README

## Overview

The Finance Management Application is an advanced web-based tool designed to simplify personal finance management by automatically extracting and classifying data from receipts. Users can track their expenses, analyze financial trends, and access currency exchange rates—all through an intuitive dashboard.

<div style="display: flex; justify-content: space-around; align-items: center;">
    <img src="images/bert.png" alt="Bert" width="49%">
    <img src="images/yolo_result.png" alt="Yolo result" width="49%">
</div>

<img src="images/dashboard.png" alt="Dashboard" style="display: block; margin: 20px auto;">

<img src="images/main.png" alt="Main" style="display: block; margin: 20px auto;">

## Key Features

1. **Automatic Expense Classification:**

    - Extracts information from receipts using OCR and YOLOv8 object detection.
    - Classifies transactions from title using a Polish BERT model (herbert-large-cased).

2. **Advanced Image Processing:**

    - Utilizes Gaussian noise reduction, morphological operations, and perspective transformations for document isolation.
    - Employs a CNN to optimize image processing workflows.
    - **Custom Algorithm**: Developed an algorithm to accurately extract receipts from contrasting backgrounds, ensuring precise document detection and preprocessing.

3. **Interactive Dashboard:**

    - Displays categorized spending with interactive charts.
    - Provides daily updated currency exchange rates.

4. **Secure User Management:**

    - Supports user registration, email-based activation, secure login and password reset.

## Technology Stack

### Frontend:

- **React** -> Material-UI

### Backend:

- **Spring Boot** -> Spring Security & Hibernate
- **FastAPI** -> Tensorflow & OpenCV & Ultralytics & Transformers

### Database:

- **PostgreSQL**

## How to Run

1. Spring Boot configuration:
   - Recommended: Java version 17 JDK and InteliJ IDEA.
   - Set an Outlook email address in `application-properties`.
   ```properties
   spring.mail.username=outlook_email_adress
   spring.mail.password=email_password
   spring.datasource.password=database_password
   ```
   - Create a PostgreSQL database named `smartexpenseapp`.


2. Python:
   - Recommended Uvicorn/Python version: 0.31.0 with Python 3.12.1 on Windows
   - Download models and training files:
      - `bert_model/link - 0.9228.zip`
      - `cnn_model/link - 0.9737.keras`
      - `yoloTrainer/link - /yolo_training_runs`
      - in `backendPython` folder:
       ```bash
       pip install -r requirements.txt
       ```
   - Unzip all archives — ensure no duplicated folders.
   - Install Tesseract and set path in the `config.py`.
   ```bash
   uvicorn main:app --reload
   ```

3. Install dependencies in `frontend/`:
   - Recommended Node.js version: v20.18.0.

   ```bash
   npm install
   ```
   ```bash
   npm start
   ```
