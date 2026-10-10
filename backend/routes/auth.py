import re
import secrets

from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from database import (
    create_auth_token,
    create_user,
    delete_auth_token,
    get_user_by_email,
    get_user_by_token,
)

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[6-9]\d{9}$")


def current_user():
    header = request.headers.get("Authorization", "")
    token = header.replace("Bearer ", "").strip() if header.startswith("Bearer ") else ""
    return get_user_by_token(token), token


@auth_bp.post("/api/auth/signup")
def signup():
    body = request.get_json(silent=True) or {}
    full_name = str(body.get("full_name") or "").strip()
    email = str(body.get("email") or "").strip().lower()
    phone = str(body.get("phone") or "").strip()
    password = str(body.get("password") or "")

    if len(full_name) < 2:
        return jsonify({"error": "invalid_name", "message": "Full name is required."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"error": "invalid_email", "message": "Enter a valid email address."}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"error": "invalid_phone", "message": "Enter a 10-digit Indian mobile number."}), 400
    if len(password) < 6:
        return jsonify({"error": "invalid_password", "message": "Password must be at least 6 characters."}), 400
    if get_user_by_email(email):
        return jsonify({"error": "email_taken", "message": "An account with this email already exists."}), 409

    user = create_user(full_name, email, phone, generate_password_hash(password))
    token = secrets.token_hex(24)
    create_auth_token(user["id"], token)
    return jsonify({"user": user, "token": token}), 201


@auth_bp.post("/api/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    record = get_user_by_email(email)
    if not record or not check_password_hash(record["password_hash"], password):
        return jsonify({"error": "invalid_credentials", "message": "Email or password is incorrect."}), 401

    token = secrets.token_hex(24)
    create_auth_token(record["id"], token)
    return jsonify(
        {
            "user": {
                "id": record["id"],
                "full_name": record["full_name"],
                "email": record["email"],
                "phone": record["phone"],
            },
            "token": token,
        }
    )


@auth_bp.get("/api/auth/me")
def me():
    user, _token = current_user()
    if not user:
        return jsonify({"error": "unauthorized", "message": "Please log in."}), 401
    return jsonify({"user": user})


@auth_bp.post("/api/auth/logout")
def logout():
    _user, token = current_user()
    if token:
        delete_auth_token(token)
    return jsonify({"ok": True})
