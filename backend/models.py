"""
Shared feature names and small helpers used by training, prediction, and the API.

Keeping the feature list in one file prevents the frontend, dataset generator,
and model from drifting apart.
"""

# Final feature vector sent to the Random Forest model.
FEATURE_COLUMNS = [
    "session_duration",
    "mouse_move_count",
    "mouse_distance",
    "average_mouse_speed",
    "maximum_mouse_speed",
    "direction_changes",
    "scroll_count",
    "scroll_distance",
    "click_count",
    "cart_time",
    "checkout_time",
    "checkout_hover_count",
    "checkout_leave_count",
    "checkout_click_count",
    "idle_time",
    "checkout_hesitation_score",
]

OUTCOME_PURCHASE = 0
OUTCOME_ABANDONED = 1


def empty_features():
    """Return a zeroed feature dictionary."""
    return {name: 0.0 for name in FEATURE_COLUMNS}
