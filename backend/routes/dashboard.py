from flask import Blueprint, jsonify, request

from database import (
    dashboard_summary,
    latest_live_session,
    list_sessions,
    probability_histogram,
    risk_level_counts,
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/api/dashboard/summary")
def summary():
    data = dashboard_summary()
    data["probability_distribution"] = probability_histogram()
    data["risk_levels"] = risk_level_counts()
    return jsonify(data)


@dashboard_bp.get("/api/dashboard/sessions")
def sessions():
    rows = list_sessions(
        search=request.args.get("search", ""),
        risk=request.args.get("risk", ""),
        outcome=request.args.get("outcome", ""),
        sort=request.args.get("sort", "date"),
        order=request.args.get("order", "desc"),
    )
    return jsonify({"sessions": rows, "count": len(rows)})


@dashboard_bp.get("/api/dashboard/live")
def live():
    session = latest_live_session()
    if not session:
        return jsonify({"session": None})
    return jsonify({"session": session})
