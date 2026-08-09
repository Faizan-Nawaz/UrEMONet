"""
main.py — FastAPI Application for UrEMONet
==========================================
Preloads heavy models on server startup to ensure fast API response times.
"""

import os
import shutil
import tempfile
import warnings
from contextlib import asynccontextmanager

import torch
import torch.nn.functional as F
import numpy as np
import librosa
import cv2
import whisper

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from moviepy.editor import VideoFileClip
from facenet_pytorch import MTCNN, InceptionResnetV1
from transformers import (
    Wav2Vec2FeatureExtractor,
    Wav2Vec2Model,
    AutoTokenizer,
    AutoModel,
)

# Import models from inference.py
from inference import (
    RobustVATTEmotionPredictor,
    VideoEmotionTransformer,
    LABEL_MAP,
)

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# 1. MODEL PATHS & GLOBAL DICTIONARY
# ─────────────────────────────────────────────

# Apne checkpoint file paths ke mutabiq adjust karein
MODEL_PATHS = {
    "fusion": "models/best_model_last.pth",
    "xlmr": "xlmr",
    "video_trf": "models/video_transformer_best.pt"
}

MODELS = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Server startup par tamaam AI models RAM/GPU mein load ho jayenge
    taa ke har API request par reload na karne parein.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    MODELS["device"] = device
    print(f"\n[Startup] Preloading UrEMONet Models on device: {device} ...")

    # 1. Audio Model: Wav2Vec2
    w2v_name = "kingabzpro/wav2vec2-large-xls-r-300m-Urdu"
    print("  -> Loading Wav2Vec2 Feature Extractor & Model...")
    MODELS["w2v_extractor"] = Wav2Vec2FeatureExtractor.from_pretrained(w2v_name)
    MODELS["w2v_model"] = Wav2Vec2Model.from_pretrained(w2v_name).to(device).eval()

    # 2. Transcription: Whisper
    print("  -> Loading Whisper (small)...")
    MODELS["whisper"] = whisper.load_model("small", device=str(device))

    # 3. Text Model: XLM-RoBERTa
    print(f"  -> Loading fine-tuned XLM-RoBERTa from {MODEL_PATHS['xlmr']}...")
    MODELS["xlmr_tokenizer"] = AutoTokenizer.from_pretrained(MODEL_PATHS["xlmr"])
    MODELS["xlmr_model"] = AutoModel.from_pretrained(MODEL_PATHS["xlmr"]).to(device).eval()

    # 4. Vision Models: MTCNN & FaceNet
    print("  -> Loading MTCNN & FaceNet...")
    MODELS["mtcnn"] = MTCNN(keep_all=False, select_largest=True, device=device, post_process=True)
    MODELS["facenet"] = InceptionResnetV1(pretrained="vggface2").eval().to(device)

    # 5. Video Transformer
    print(f"  -> Loading VideoEmotionTransformer from {MODEL_PATHS['video_trf']}...")
    vid_trf = VideoEmotionTransformer(input_dim=512, hidden_dim=256, num_heads=2, num_layers=4, num_classes=5)
    s_dict = torch.load(MODEL_PATHS["video_trf"], map_location=device)
    s_dict = {k.replace("module.", ""): v for k, v in s_dict.items()}
    missing, unexpected = vid_trf.load_state_dict(s_dict, strict=False)

    print(f"  Video Transformer missing keys: {missing}")
    print(f"  Video Transformer unexpected keys: {unexpected}")
    MODELS["video_trf"] = vid_trf.to(device).eval()

    # 6. Fusion Model
    print(f"  -> Loading RobustVATTEmotionPredictor from {MODEL_PATHS['fusion']}...")
    fusion = RobustVATTEmotionPredictor(audio_dim=1024, text_dim=768, video_dim=256, hidden_dim=512, num_classes=5)
    f_dict = torch.load(MODEL_PATHS["fusion"], map_location=device)
    f_dict = {k.replace("module.", ""): v for k, v in f_dict.items()}
    fusion.load_state_dict(f_dict)
    MODELS["fusion"] = fusion.to(device).eval()

    print("[Startup] All models loaded successfully and ready for API requests!\n")
    yield
    MODELS.clear()


# FastAPI App Definition
app = FastAPI(
    title="UrEMONet — Multimodal Urdu Emotion Recognition API",
    description="API for Urdu Drama Clips Emotion Classification (Audio, Text, Video Fusion)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup (Frontend integrate karne ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response Schema
class EmotionResponse(BaseModel):
    predicted_emotion: str
    transcription: str
    probabilities: dict[str, float]


# ─────────────────────────────────────────────
# 2. INFERENCE PIPELINE FUNCTION
# ─────────────────────────────────────────────

def process_pipeline(video_path: str):
    device = MODELS["device"]
    tmp_audio = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tmp_audio.close()

    try:
        # Step 1: Extract Audio from Video
        clip = VideoFileClip(video_path)
        if clip.audio is None:
            raise ValueError("Input video contains no audio track.")
        clip.audio.write_audiofile(tmp_audio.name, logger=None)
        clip.audio.close()
        clip.close()

        # Step 2: Audio Feature Extraction (Wav2Vec2)
        y, sr = librosa.load(tmp_audio.name, sr=16000)
        y = y[: 16000 * 10]  # 10s Truncation
        inputs = MODELS["w2v_extractor"](y, return_tensors="pt", sampling_rate=sr).to(device)
        with torch.no_grad():
            audio_feat = MODELS["w2v_model"](**inputs).last_hidden_state.mean(dim=1)  # (1, 1024)

        # Step 3: Transcription (Whisper)
        res = MODELS["whisper"].transcribe(tmp_audio.name, language="ur")
        transcription = res["text"].strip()

        # Step 4: Text Feature Extraction (XLM-RoBERTa)
        txt_inputs = MODELS["xlmr_tokenizer"](
            transcription if transcription else " ",
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt"
        ).to(device)
        with torch.no_grad():
            text_feat = MODELS["xlmr_model"](**txt_inputs).last_hidden_state.mean(dim=1)  # (1, 768)

        # Step 5: Video Frame Extraction (1-FPS sampling)
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frame_interval = max(int(round(fps)), 1)

        frames = []
        idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if idx % frame_interval == 0:
                frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            idx += 1
        cap.release()

        if not frames:
            raise ValueError("No readable frames found in the video.")

        # Face detection & FaceNet embedding
        face_embeddings = []
        for frame_rgb in frames:
            with torch.no_grad():
                face = MODELS["mtcnn"](frame_rgb)
                if face is not None:
                    emb = MODELS["facenet"](face.unsqueeze(0).to(device)).cpu()
                    face_embeddings.append(emb)

        if not face_embeddings:
            raise ValueError("No faces detected in video frames for emotion recognition.")

        face_embeddings = torch.cat(face_embeddings, dim=0)  # (N, 512)

        # Build sequence (max_len = 15)
        n = face_embeddings.shape[0]
        if n < 15:
            pad = torch.zeros((15 - n, 512))
            seq = torch.cat((face_embeddings, pad), dim=0)
        else:
            seq = face_embeddings[:15]

        sequence = seq.unsqueeze(0).to(device).float()  # (1, 15, 512)
        mask = (sequence.sum(dim=-1) == 0).to(device)

        # Video Transformer & Final Fusion Forward Pass
        with torch.no_grad():
            video_feat = MODELS["video_trf"](sequence, mask=mask, extract_embeddings=True)  # (1, 256)
            logits = MODELS["fusion"](audio_feat, video_feat, text_feat)  # (1, 5)
            probs = F.softmax(logits, dim=-1).squeeze(0).cpu().numpy()

        predicted_idx = int(np.argmax(probs))
        predicted_emotion = LABEL_MAP.get(predicted_idx, "Unknown")
        prob_dict = {LABEL_MAP[i]: float(probs[i]) for i in range(len(probs))}

        return predicted_emotion, transcription, prob_dict

    finally:
        # Temp Audio File Cleanup
        if os.path.exists(tmp_audio.name):
            os.remove(tmp_audio.name)


# ─────────────────────────────────────────────
# 3. ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "UrEMONet API is up and running!"}


@app.post("/predict", response_model=EmotionResponse)
async def predict_emotion(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload an .mp4, .avi, .mov, or .mkv video file."
        )

    # Temporary file storage for input video
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_video:
        shutil.copyfileobj(file.file, tmp_video)
        tmp_video_path = tmp_video.name

    try:
        emotion, transcription, probs = process_pipeline(tmp_video_path)
        return EmotionResponse(
            predicted_emotion=emotion,
            transcription=transcription,
            probabilities=probs
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Temp Video File Cleanup
        if os.path.exists(tmp_video_path):
            os.remove(tmp_video_path)