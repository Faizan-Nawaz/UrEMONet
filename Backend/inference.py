"""
inference.py — UrEMONet Model Architectures & Feature Extraction Logic
"""

import math
import warnings
import torch
import torch.nn as nn
import numpy as np

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# 1. MODEL ARCHITECTURES (Exact Match with Training)
# ─────────────────────────────────────────────

class FeedForwardNetwork(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(FeedForwardNetwork, self).__init__()
        self.ffn = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim, hidden_dim)
        )

    def forward(self, x):
        return self.ffn(x)


class GatedFusion(nn.Module):
    def __init__(self, input_dims, hidden_dim):
        super(GatedFusion, self).__init__()
        self.gate = nn.Sequential(
            nn.Linear(sum(input_dims), hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, len(input_dims)),
            nn.Sigmoid()
        )

    def forward(self, features):
        combined = torch.cat(features, dim=-1)
        weights = self.gate(combined)
        weighted_features = [f * weights[:, i:i+1] for i, f in enumerate(features)]
        return torch.cat(weighted_features, dim=-1)


class RobustVATTEmotionPredictor(nn.Module):
    def __init__(self, audio_dim=1024, text_dim=768, video_dim=256, hidden_dim=512, num_classes=5):
        super(RobustVATTEmotionPredictor, self).__init__()
        self.audio_encoder = FeedForwardNetwork(audio_dim, hidden_dim)
        self.text_encoder = FeedForwardNetwork(text_dim, hidden_dim)
        self.video_encoder = FeedForwardNetwork(video_dim, hidden_dim)
        self.fusion = GatedFusion([hidden_dim, hidden_dim, hidden_dim], hidden_dim)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 3, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, audio, video, text):
        a = self.audio_encoder(audio)
        v = self.video_encoder(video)
        t = self.text_encoder(text)
        fused = self.fusion([a, v, t])
        return self.classifier(fused)


class PositionalEncoding(nn.Module):
    def __init__(self, hidden_dim, max_len=15):
        super(PositionalEncoding, self).__init__()
        pe = torch.zeros(max_len, hidden_dim)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, hidden_dim, 2).float() * (-math.log(10000.0) / hidden_dim))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe.unsqueeze(0))

    def forward(self, x):
        return x + self.pe[:, :x.size(1), :]


class VideoEmotionTransformer(nn.Module):
    def __init__(self, input_dim=512, hidden_dim=256, num_heads=2, num_layers=4, num_classes=5, dropout=0.0, max_len=15):
        super(VideoEmotionTransformer, self).__init__()
        self.fc_in = nn.Linear(input_dim, hidden_dim)
        self.positional_encoding = PositionalEncoding(hidden_dim, max_len)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dropout=dropout
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers)
        self.fc_out = nn.Linear(hidden_dim, num_classes)

    def forward(self, x, mask=None, extract_embeddings=False):
        x = self.fc_in(x)
        x = self.positional_encoding(x)
        x = x.permute(1, 0, 2)
        output = self.transformer_encoder(x, src_key_padding_mask=mask)
        output = output.permute(1, 0, 2)

        if extract_embeddings:
            return output.mean(dim=1)

        output = output.mean(dim=1)
        return self.fc_out(output)


# Label mappings (Alphabetical)
LABEL_MAP = {
    0: "Anger",
    1: "Happy",
    2: "Love",
    3: "Neutral",
    4: "Sad"
}