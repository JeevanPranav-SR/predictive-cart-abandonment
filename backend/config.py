"""
Simple project configuration.

Risk thresholds and tracking intervals are kept in one place so a student
can change them without hunting through the codebase.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
ML_DIR = os.path.join(BASE_DIR, "ml")

DATABASE_PATH = os.environ.get("CARTT_DB", os.path.join(DATA_DIR, "cartt.db"))
MODEL_PATH = os.environ.get("CARTT_MODEL", os.path.join(ML_DIR, "model.pkl"))
METRICS_PATH = os.path.join(ML_DIR, "metrics.json")
DATASET_PATH = os.path.join(DATA_DIR, "sessions.csv")

# Risk bands used by the prediction API and dashboard.
# Values are inclusive on the upper bound except LOW which is [0, LOW_MAX].
RISK_LOW_MAX = float(os.environ.get("CARTT_RISK_LOW_MAX", "0.39"))
RISK_MEDIUM_MAX = float(os.environ.get("CARTT_RISK_MEDIUM_MAX", "0.69"))

CORS_ORIGINS = os.environ.get(
    "CARTT_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

# Reasonable caps so a tampered client cannot send extreme values.
FEATURE_BOUNDS = {
    "session_duration": (0, 86_400),
    "mouse_move_count": (0, 200_000),
    "mouse_distance": (0, 5_000_000),
    "average_mouse_speed": (0, 20_000),
    "maximum_mouse_speed": (0, 50_000),
    "direction_changes": (0, 50_000),
    "scroll_count": (0, 50_000),
    "scroll_distance": (0, 5_000_000),
    "click_count": (0, 10_000),
    "cart_time": (0, 86_400),
    "checkout_time": (0, 86_400),
    "checkout_hover_count": (0, 10_000),
    "checkout_leave_count": (0, 10_000),
    "checkout_click_count": (0, 1_000),
    "idle_time": (0, 86_400),
    "checkout_hesitation_score": (0, 1),
}
