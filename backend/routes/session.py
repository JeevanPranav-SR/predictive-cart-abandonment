import uuid

from flask import Blueprint, jsonify, request

from database import (
    create_session,
    end_session,
    get_session,
    latest_features,
    save_features,
    update_session,
)
from models import OUTCOME_ABANDONED, OUTCOME_PURCHASE
from prediction import ModelNotReadyError, predict_abandonment
from tracking import sanitize_features

session_bp = Blueprint("session", __name__)


def _json():
    return request.get_json(silent=True) or {}


def _require_session(session_id):
    if not session_id or not isinstance(session_id, str):
        return None, (jsonify({"error": "session_id is required"}), 400)
    if len(session_id) > 80:
        return None, (jsonify({"error": "invalid session_id"}), 400)
    session = get_session(session_id)
    if not session:
        return None, (jsonify({"error": "session not found"}), 404)
    return session, None


@session_bp.post("/api/session/start")
def start_session():
    body = _json()
    session_id = body.get("session_id") or f"DEMO-{uuid.uuid4().hex[:8].upper()}"
    if get_session(session_id):
        return jsonify({"session": get_session(session_id), "created": False})

    tracking_enabled = 1 if body.get("tracking_enabled", True) else 0
    session = create_session(
        session_id=session_id,
        tracking_enabled=tracking_enabled,
        page=str(body.get("page") or "home")[:60],
        cart_status=str(body.get("cart_status") or "empty")[:40],
    )
    return jsonify({"session": session, "created": True}), 201


@session_bp.post("/api/session/events")
def ingest_events():
    """
    Accept a summarized event batch (not raw mouse points).
    Useful for debugging and for storing a lightweight activity log.
    """
    body = _json()
    session, error = _require_session(body.get("session_id"))
    if error:
        return error

    page = str(body.get("page") or session["page"] or "unknown")[:60]
    cart_status = str(body.get("cart_status") or session["cart_status"] or "unknown")[:40]
    update_session(session["session_id"], page=page, cart_status=cart_status)

    return jsonify(
        {
            "ok": True,
            "accepted": {
                "mouse_samples": int(body.get("mouse_samples") or 0),
                "scroll_events": int(body.get("scroll_events") or 0),
                "click_events": int(body.get("click_events") or 0),
            },
        }
    )


@session_bp.post("/api/session/features")
def ingest_features():
    body = _json()
    session, error = _require_session(body.get("session_id"))
    if error:
        return error

    features = sanitize_features(body.get("features") or body)
    saved = save_features(session["session_id"], features)
    update_session(
        session["session_id"],
        page=str(body.get("page") or session["page"] or "unknown")[:60],
        cart_status=str(body.get("cart_status") or session["cart_status"] or "unknown")[:40],
    )
    return jsonify({"ok": True, "features": saved})


@session_bp.post("/api/session/purchase")
def mark_purchase():
    body = _json()
    session, error = _require_session(body.get("session_id"))
    if error:
        return error
    updated = end_session(session["session_id"], OUTCOME_PURCHASE)
    return jsonify({"ok": True, "outcome": 0, "label": "purchased", "session": updated})


@session_bp.post("/api/session/abandon")
def mark_abandon():
    body = _json()
    session, error = _require_session(body.get("session_id"))
    if error:
        return error
    updated = end_session(session["session_id"], OUTCOME_ABANDONED)
    return jsonify({"ok": True, "outcome": 1, "label": "abandoned", "session": updated})


@session_bp.get("/api/session/<session_id>")
def read_session(session_id):
    session, error = _require_session(session_id)
    if error:
        return error
    return jsonify(
        {
            "session": session,
            "features": latest_features(session_id),
        }
    )
