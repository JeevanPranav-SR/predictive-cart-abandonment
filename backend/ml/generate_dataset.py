"""
Generate a SYNTHETIC demonstration dataset.

This is not real customer data. The relationships below are designed so a
college demo can train a model that responds to hesitation, idle time, and
checkout hover/leave patterns. Real production use would require ethically
collected, consented session data.
"""

import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1]))

from config import DATA_DIR, DATASET_PATH  # noqa: E402
from models import FEATURE_COLUMNS  # noqa: E402


def _sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))


def generate_one_session(rng):
    """
    Build one noisy session.

    A hidden 'abandon tendency' influences several features, then extra
    random noise is added so the classes are not perfectly separable.
    """
    # 1 = more likely to abandon, 0 = more likely to purchase
    abandon_bias = rng.binomial(1, 0.48)

    session_duration = rng.gamma(4.2, 38) + rng.uniform(20, 80)
    cart_time = rng.gamma(2.2, 12) + (40 if abandon_bias else 10)
    checkout_time = max(0.0, rng.normal(40 if abandon_bias else 18, 10))
    idle_time = rng.gamma(1.8, 6) + (30 if abandon_bias else 3)

    mouse_move_count = int(rng.integers(90, 420) + (180 if abandon_bias else 0))
    mouse_distance = mouse_move_count * rng.uniform(18, 55)
    average_mouse_speed = rng.uniform(50, 220)
    maximum_mouse_speed = average_mouse_speed * rng.uniform(1.6, 4.2)
    direction_changes = int(mouse_move_count * rng.uniform(0.04, 0.16))

    scroll_count = int(rng.integers(3, 14) + (16 if abandon_bias else 0))
    scroll_distance = scroll_count * rng.uniform(80, 260)

    if abandon_bias:
        checkout_hover_count = int(rng.integers(4, 11))
        checkout_leave_count = max(0, checkout_hover_count - int(rng.integers(0, 2)))
        checkout_click_count = 0 if rng.random() < 0.82 else 1
    else:
        checkout_hover_count = int(rng.integers(0, 3))
        checkout_leave_count = int(rng.integers(0, max(1, checkout_hover_count)))
        checkout_click_count = int(rng.integers(1, 3))

    click_count = int(rng.integers(4, 14) + checkout_click_count)

    # Same formula idea as tracking.py, with noise so the label is not a copy.
    leave_ratio = checkout_leave_count / checkout_hover_count if checkout_hover_count else 0
    hesitation = (
        0.38 * min(leave_ratio, 1.2)
        + 0.18 * min(checkout_hover_count / 8.0, 1.0)
        + 0.14 * min(idle_time / 90.0, 1.0)
        + 0.12 * min(cart_time / 180.0, 1.0)
        + (0.28 if checkout_hover_count >= 2 and checkout_click_count == 0 else 0.0)
        - min(checkout_click_count * 0.22, 0.45)
    )
    hesitation = float(np.clip(hesitation + rng.normal(0, 0.07), 0, 1))

    # Negative intercept keeps the two classes closer to balanced.
    latent = (
        -1.55
        + 2.35 * hesitation
        + 0.018 * idle_time
        + 0.008 * cart_time
        + 0.09 * checkout_leave_count
        + 0.025 * scroll_count
        - 0.95 * checkout_click_count
        + rng.normal(0, 0.70)
    )
    abandoned = int(rng.random() < _sigmoid(latent))

    row = {
        "session_duration": round(float(session_duration), 2),
        "mouse_move_count": int(mouse_move_count),
        "mouse_distance": round(float(mouse_distance), 2),
        "average_mouse_speed": round(float(average_mouse_speed), 2),
        "maximum_mouse_speed": round(float(maximum_mouse_speed), 2),
        "direction_changes": int(direction_changes),
        "scroll_count": int(scroll_count),
        "scroll_distance": round(float(scroll_distance), 2),
        "click_count": int(click_count),
        "cart_time": round(float(cart_time), 2),
        "checkout_time": round(float(checkout_time), 2),
        "checkout_hover_count": int(checkout_hover_count),
        "checkout_leave_count": int(checkout_leave_count),
        "checkout_click_count": int(checkout_click_count),
        "idle_time": round(float(idle_time), 2),
        "checkout_hesitation_score": round(hesitation, 4),
        "abandoned": abandoned,
    }
    return row


def generate_dataset(n_sessions=1200, seed=42):
    rng = np.random.default_rng(seed)
    rows = [generate_one_session(rng) for _ in range(n_sessions)]
    frame = pd.DataFrame(rows, columns=FEATURE_COLUMNS + ["abandoned"])
    return frame


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    frame = generate_dataset()
    frame.to_csv(DATASET_PATH, index=False)
    abandoned_rate = frame["abandoned"].mean()
    print(f"Wrote {len(frame)} synthetic sessions to {DATASET_PATH}")
    print(f"Abandoned rate: {abandoned_rate:.3f}")
    print("NOTE: This file is demonstration data, not real shopper data.")


if __name__ == "__main__":
    main()
