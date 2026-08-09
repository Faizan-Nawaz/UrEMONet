from fastapi import FastAPI

app = FastAPI(
    title="UrEMONet API",
    description="Multimodal Emotion Recognition API",
    version="1.0"
)

@app.get("/")
def home():
    return {
        "message": "UrEMONet Backend is Running"
    }

@app.get("/health")
def health():
    return {
        "status": "OK"
    }