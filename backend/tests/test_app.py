"""Basic API and feature tests for the cart-abandonment demo."""

import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault("CARTT_DB", str(ROOT / "data" / "test_cartt.db"))

from app import create_app  # noqa: E402
from database import init_db  # noqa: E402
from prediction import classify_risk  # noqa: E402
from tracking import compute_hesitation_score, sanitize_features  # noqa: E402


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("CARTT_DB", str(db_path))
    import config
    import database

    monkeypatch.setattr(config, "DATABASE_PATH", str(db_path))
    monkeypatch.setattr(database, "DATABASE_PATH", str(db_path))
    init_db()
    app = create_app()
    app.config["TESTING"] = True
    return app.test_client()


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_session_create_purchase_and_abandon(client):
    started = client.post("/api/session/start", json={"tracking_enabled": True})
    assert started.status_code == 201
    session_id = started.get_json()["session"]["session_id"]

    purchased = client.post("/api/session/purchase", json={"session_id": session_id})
    assert purchased.status_code == 200
    assert purchased.get_json()["outcome"] == 0

    started_two = client.post("/api/session/start", json={})
    session_two = started_two.get_json()["session"]["session_id"]
    abandoned = client.post("/api/session/abandon", json={"session_id": session_two})
    assert abandoned.get_json()["outcome"] == 1


def test_invalid_session(client):
    response = client.post("/api/session/purchase", json={"session_id": "missing"})
    assert response.status_code == 404


def test_feature_sanitization_clamps_and_recomputes_hesitation():
    dirty = {
        "session_duration": -10,
        "mouse_move_count": 50,
        "checkout_hover_count": 8,
        "checkout_leave_count": 7,
        "checkout_click_count": 0,
        "idle_time": 40,
        "cart_time": 100,
        "checkout_hesitation_score": 0.01,
    }
    clean = sanitize_features(dirty)
    assert clean["session_duration"] == 0
    assert clean["checkout_hesitation_score"] == compute_hesitation_score(clean)
    assert clean["checkout_hesitation_score"] > 0.4


def test_risk_classification():
    assert classify_risk(0.12) == "LOW"
    assert classify_risk(0.51) == "MEDIUM"
    assert classify_risk(0.82) == "HIGH"


def test_predict_endpoint_uses_model(client):
    payload = {
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
    response = client.post("/api/predict", json=payload)
    if response.status_code == 503:
        pytest.skip("Model has not been trained yet")
    data = response.get_json()
    assert "abandonment_probability" in data
    assert data["risk_level"] in {"LOW", "MEDIUM", "HIGH"}


def test_dashboard_summary(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    body = response.get_json()
    assert "total_sessions" in body
    assert "abandonment_rate" in body


def test_signup_login_and_required_checkout(client):
    signup = client.post(
        "/api/auth/signup",
        json={
            "full_name": "Asha Rao",
            "email": "asha@college.edu",
            "phone": "9876543210",
            "password": "secret1",
        },
    )
    assert signup.status_code == 201
    token = signup.get_json()["token"]

    denied = client.post("/api/checkout", json={"full_name": "Asha"})
    assert denied.status_code == 401

    incomplete = client.post(
        "/api/checkout",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Asha", "amount": 1000},
    )
    assert incomplete.status_code == 400

    placed = client.post(
        "/api/checkout",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "Asha Rao",
            "email": "asha@college.edu",
            "phone": "9876543210",
            "address": "12 College Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560001",
            "payment_method": "cod",
            "amount": 7999,
        },
    )
    assert placed.status_code == 201

    login = client.post(
        "/api/auth/login",
        json={"email": "asha@college.edu", "password": "secret1"},
    )
    assert login.status_code == 200
