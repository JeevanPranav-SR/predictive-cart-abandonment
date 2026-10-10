from flask import Blueprint, jsonify, request

from database import get_session, save_features, save_prediction
from prediction import ModelNotReadyError, predict_abandonment
from tracking import sanitize_features

predict_bp = Blueprint("predict", __name__)


@predict_bp.post("/api/predict")
def predict():
    body = request.get_json(silent=True) or {}
    features = sanitize_features(body.get("features") or body)

    try:
        result = predict_abandonment(features)
    except ModelNotReadyError as exc:
        return jsonify({"error": "model_unavailable", "message": str(exc)}), 503
    except Exception:
        return jsonify(
            {
                "error": "prediction_failed",
                "message": "Prediction temporarily unavailable",
            }
        ), 500

    session_id = body.get("session_id")
    if session_id and get_session(session_id):
        save_features(session_id, features)
        save_prediction(session_id, result["abandonment_probability"], result["risk_level"])

    return jsonify({**result, "features": features})
