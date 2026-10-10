"""
Load the trained Random Forest and turn a feature vector into a risk label.
"""

import os

import joblib
import pandas as pd

from config import MODEL_PATH, RISK_LOW_MAX, RISK_MEDIUM_MAX
from models import FEATURE_COLUMNS


_MODEL = None


class ModelNotReadyError(RuntimeError):
    pass


def classify_risk(probability):
    """Map a probability in [0, 1] to LOW / MEDIUM / HIGH."""
    value = max(0.0, min(1.0, float(probability)))
    if value <= RISK_LOW_MAX:
        return "LOW"
    if value <= RISK_MEDIUM_MAX:
        return "MEDIUM"
    return "HIGH"


def load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    if not os.path.exists(MODEL_PATH):
        raise ModelNotReadyError(
            "Model file is missing. Run: python ml/generate_dataset.py && python ml/train_model.py"
        )
    _MODEL = joblib.load(MODEL_PATH)
    return _MODEL


def predict_abandonment(features):
    """
    Return abandonment probability and risk level.

    The model outputs P(abandoned = 1). This is a predictive estimate from
    interaction patterns, not a measurement of a person's intent.
    """
    model = load_model()
    row = pd.DataFrame([{name: float(features[name]) for name in FEATURE_COLUMNS}])
    probability = float(model.predict_proba(row)[0][1])
    return {
        "abandonment_probability": round(probability, 4),
        "risk_level": classify_risk(probability),
    }
