"""
Server-side feature validation and hesitation scoring.

The browser computes most features, but the API never trusts those values
blindly. Counts are clamped to safe ranges and hesitation is recomputed
from the hover / leave / click counts.
"""

from config import FEATURE_BOUNDS
from models import FEATURE_COLUMNS, empty_features


def clamp(value, low, high):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0.0
    if number < low:
        return float(low)
    if number > high:
        return float(high)
    return number


def compute_hesitation_score(features):
    """
    Behavioral indicator only — not a psychological measurement.

    Repeated hover → leave patterns without a checkout click raise the score.
    Completing a checkout click lowers it.
    """
    hover = clamp(features.get("checkout_hover_count", 0), 0, 10_000)
    leave = clamp(features.get("checkout_leave_count", 0), 0, 10_000)
    clicks = clamp(features.get("checkout_click_count", 0), 0, 1_000)
    idle = clamp(features.get("idle_time", 0), 0, 86_400)
    cart_time = clamp(features.get("cart_time", 0), 0, 86_400)

    leave_ratio = (leave / hover) if hover > 0 else 0.0
    hover_pressure = min(hover / 8.0, 1.0)
    idle_pressure = min(idle / 90.0, 1.0)
    cart_pressure = min(cart_time / 180.0, 1.0)
    no_click_penalty = 0.28 if hover >= 2 and clicks == 0 else 0.0
    click_relief = min(clicks * 0.22, 0.45)

    score = (
        0.38 * min(leave_ratio, 1.2)
        + 0.18 * hover_pressure
        + 0.14 * idle_pressure
        + 0.12 * cart_pressure
        + no_click_penalty
        - click_relief
    )
    return round(min(max(score, 0.0), 1.0), 4)


def sanitize_features(raw):
    """Return a complete, clamped feature vector."""
    incoming = raw if isinstance(raw, dict) else {}
    clean = empty_features()

    for name in FEATURE_COLUMNS:
        low, high = FEATURE_BOUNDS[name]
        clean[name] = clamp(incoming.get(name, 0), low, high)

    # Recompute hesitation on the server so a client cannot force a score.
    clean["checkout_hesitation_score"] = compute_hesitation_score(clean)
    return clean
