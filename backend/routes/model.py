import json
import os

from flask import Blueprint, jsonify, request

from config import METRICS_PATH
from models import FEATURE_COLUMNS, empty_features
from prediction import ModelNotReadyError, predict_abandonment
from tracking import sanitize_features

model_bp = Blueprint("model", __name__)


def _load_metrics():
    if not os.path.exists(METRICS_PATH):
        return None
    with open(METRICS_PATH, encoding="utf-8") as handle:
        return json.load(handle)


@model_bp.get("/api/model/metrics")
def metrics():
    payload = _load_metrics()
    if not payload:
        return jsonify({"error": "metrics_missing", "message": "Train the model first."}), 404
    return jsonify(payload)


@model_bp.get("/api/model/features")
def features():
    payload = _load_metrics()
    importance = payload["feature_importance"] if payload else []
    return jsonify(
        {
            "features": FEATURE_COLUMNS,
            "feature_importance": importance,
            "source": "trained Random Forest" if importance else "unavailable",
        }
    )


def _scenario_features(level):
    """
    Typical feature vectors used only by the /demo simulator.
    They still go through sanitize_features + the real model.
    """
    base = empty_features()
    if level == "low":
        base.update(
            {
                "session_duration": 70,
                "mouse_move_count": 160,
                "mouse_distance": 4200,
                "average_mouse_speed": 140,
                "maximum_mouse_speed": 260,
                "direction_changes": 12,
                "scroll_count": 6,
                "scroll_distance": 900,
                "click_count": 7,
                "cart_time": 14,
                "checkout_time": 18,
                "checkout_hover_count": 1,
                "checkout_leave_count": 0,
                "checkout_click_count": 2,
                "idle_time": 4,
            }
        )
    elif level == "medium":
        base.update(
            {
                "session_duration": 150,
                "mouse_move_count": 340,
                "mouse_distance": 9800,
                "average_mouse_speed": 110,
                "maximum_mouse_speed": 340,
                "direction_changes": 36,
                "scroll_count": 16,
                "scroll_distance": 2800,
                "click_count": 9,
                "cart_time": 55,
                "checkout_time": 32,
                "checkout_hover_count": 3,
                "checkout_leave_count": 2,
                "checkout_click_count": 0,
                "idle_time": 18,
            }
        )
    else:
        base.update(
            {
                "session_duration": 240,
                "mouse_move_count": 620,
                "mouse_distance": 17600,
                "average_mouse_speed": 85,
                "maximum_mouse_speed": 420,
                "direction_changes": 70,
                "scroll_count": 28,
                "scroll_distance": 5100,
                "click_count": 11,
                "cart_time": 120,
                "checkout_time": 48,
                "checkout_hover_count": 8,
                "checkout_leave_count": 7,
                "checkout_click_count": 0,
                "idle_time": 46,
            }
        )
    return sanitize_features(base)


@model_bp.post("/api/demo/simulate")
def simulate():
    body = request.get_json(silent=True) or {}
    level = str(body.get("level") or "high").lower()
    if level not in {"low", "medium", "high"}:
        return jsonify({"error": "level must be low, medium, or high"}), 400

    features = _scenario_features(level)
    try:
        result = predict_abandonment(features)
    except ModelNotReadyError as exc:
        return jsonify({"error": "model_unavailable", "message": str(exc)}), 503

    return jsonify(
        {
            **result,
            "requested_level": level.upper(),
            "features": features,
            "note": "Features were generated for the demo, then scored by the real Random Forest.",
        }
    )
