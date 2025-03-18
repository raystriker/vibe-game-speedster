# Project Setup Guide

## Installation

```
pip install -r requirements.txt
```

## Running the Frontend

Navigate to the frontend folder:
```
cd frontend
python -m http.server 8080
```
The frontend will be accessible at http://localhost:8080

## Running the Backend

Navigate to the backend folder:
```
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
The backend API will be accessible at http://localhost:8000