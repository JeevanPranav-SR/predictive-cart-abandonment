from flask import Blueprint, jsonify

from prediction import ModelNotReadyError, load_model

health_bp = Blueprint("health", __name__)


@health_bp.get("/api/health")
def health():
    model_ready = True
    model_error = None
    try:
        load_model()
    except ModelNotReadyError as exc:
        model_ready = False
        model_error = str(exc)

    return jsonify(
        {
            "status": "ok",
            "service": "cartt-backend",
            "model_ready": model_ready,
            "model_error": model_error,
        }
    )
