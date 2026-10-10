"""
Feature-list helpers shared by dataset generation and training.
"""

import sys
from pathlib import Path

# Allow `python ml/train_model.py` to import backend modules.
sys.path.append(str(Path(__file__).resolve().parents[1]))

from models import FEATURE_COLUMNS  # noqa: E402


def feature_matrix(frame):
    missing = [name for name in FEATURE_COLUMNS if name not in frame.columns]
    if missing:
        raise ValueError(f"Dataset is missing columns: {missing}")
    return frame[FEATURE_COLUMNS]
