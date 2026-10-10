import re

from flask import Blueprint, jsonify, request

from database import create_order, get_session
from routes.auth import current_user

checkout_bp = Blueprint("checkout", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[6-9]\d{9}$")
PIN_RE = re.compile(r"^\d{6}$")


@checkout_bp.post("/api/checkout")
def place_order():
    user, _token = current_user()
    if not user:
        return jsonify({"error": "unauthorized", "message": "Please log in before checkout."}), 401

    body = request.get_json(silent=True) or {}
    full_name = str(body.get("full_name") or "").strip()
    email = str(body.get("email") or "").strip().lower()
    phone = str(body.get("phone") or "").strip()
    address = str(body.get("address") or "").strip()
    city = str(body.get("city") or "").strip()
    state = str(body.get("state") or "").strip()
    pincode = str(body.get("pincode") or "").strip()
    payment_method = str(body.get("payment_method") or "").strip().lower()
    session_id = body.get("session_id")

    errors = []
    if len(full_name) < 2:
        errors.append("Full name is required.")
    if not EMAIL_RE.match(email):
        errors.append("Enter a valid email address.")
    if not PHONE_RE.match(phone):
        errors.append("Enter a 10-digit Indian mobile number.")
    if len(address) < 8:
        errors.append("Enter a complete delivery address.")
    if len(city) < 2:
        errors.append("City is required.")
    if len(state) < 2:
        errors.append("State is required.")
    if not PIN_RE.match(pincode):
        errors.append("Enter a 6-digit PIN code.")
    if payment_method not in {"cod", "upi"}:
        errors.append("Choose Cash on Delivery or UPI.")
    if payment_method == "upi":
        upi_id = str(body.get("upi_id") or "").strip()
        if not re.match(r"^[\w.\-]{2,}@[\w]{2,}$", upi_id):
            errors.append("Enter a valid UPI ID, for example name@okaxis.")

    try:
        amount = float(body.get("amount") or 0)
    except (TypeError, ValueError):
        amount = 0
    if amount <= 0:
        errors.append("Order amount is missing.")

    if session_id and not get_session(session_id):
        session_id = None

    if errors:
        return jsonify({"error": "validation_failed", "message": errors[0], "errors": errors}), 400

    order = create_order(
        {
            "user_id": user["id"],
            "session_id": session_id,
            "full_name": full_name[:80],
            "email": email[:120],
            "phone": phone,
            "address": address[:200],
            "city": city[:60],
            "state": state[:60],
            "pincode": pincode,
            "payment_method": payment_method,
            "amount": amount,
        }
    )
    return jsonify({"ok": True, "order": {"id": order["id"], "amount": order["amount"]}}), 201
