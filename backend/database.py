"""
SQLite helpers for sessions, behavioral features, and predictions.

Tables stay simple so students can inspect the database with any SQLite viewer.
"""

import os
import sqlite3
from datetime import datetime, timezone

from config import DATABASE_PATH, DATA_DIR
from models import FEATURE_COLUMNS, empty_features


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def get_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they do not already exist."""
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            updated_at TEXT NOT NULL,
            page TEXT,
            cart_status TEXT,
            outcome INTEGER,
            tracking_enabled INTEGER DEFAULT 1
        )
        """
    )

    feature_cols = ",\n            ".join(f"{name} REAL" for name in FEATURE_COLUMNS)
    cur.execute(
        f"""
        CREATE TABLE IF NOT EXISTS behavioral_features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            {feature_cols},
            FOREIGN KEY(session_id) REFERENCES sessions(session_id)
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            probability REAL NOT NULL,
            risk_level TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(session_id) REFERENCES sessions(session_id)
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS auth_tokens (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_id TEXT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            amount REAL NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    conn.commit()
    conn.close()


def create_session(session_id, tracking_enabled=1, page="home", cart_status="empty"):
    now = utc_now()
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO sessions (session_id, started_at, updated_at, page, cart_status, tracking_enabled)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (session_id, now, now, page, cart_status, 1 if tracking_enabled else 0),
    )
    conn.commit()
    conn.close()
    return get_session(session_id)


def get_session(session_id):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM sessions WHERE session_id = ?", (session_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_session(session_id, **fields):
    if not fields:
        return get_session(session_id)

    fields["updated_at"] = utc_now()
    assignments = ", ".join(f"{key} = ?" for key in fields)
    values = list(fields.values()) + [session_id]

    conn = get_connection()
    conn.execute(f"UPDATE sessions SET {assignments} WHERE session_id = ?", values)
    conn.commit()
    conn.close()
    return get_session(session_id)


def save_features(session_id, features):
    now = utc_now()
    payload = empty_features()
    payload.update({k: features.get(k, 0) for k in FEATURE_COLUMNS})

    columns = ["session_id", "recorded_at"] + FEATURE_COLUMNS
    placeholders = ", ".join("?" for _ in columns)
    values = [session_id, now] + [payload[name] for name in FEATURE_COLUMNS]

    conn = get_connection()
    conn.execute(
        f"INSERT INTO behavioral_features ({', '.join(columns)}) VALUES ({placeholders})",
        values,
    )
    conn.execute(
        "UPDATE sessions SET updated_at = ? WHERE session_id = ?",
        (now, session_id),
    )
    conn.commit()
    conn.close()
    return payload


def latest_features(session_id):
    conn = get_connection()
    row = conn.execute(
        """
        SELECT * FROM behavioral_features
        WHERE session_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (session_id,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def save_prediction(session_id, probability, risk_level):
    now = utc_now()
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO predictions (session_id, probability, risk_level, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (session_id, probability, risk_level, now),
    )
    conn.execute(
        "UPDATE sessions SET updated_at = ? WHERE session_id = ?",
        (now, session_id),
    )
    conn.commit()
    conn.close()


def latest_prediction(session_id):
    conn = get_connection()
    row = conn.execute(
        """
        SELECT * FROM predictions
        WHERE session_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (session_id,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def end_session(session_id, outcome):
    return update_session(session_id, outcome=outcome, ended_at=utc_now())


def dashboard_summary():
    conn = get_connection()

    total = conn.execute("SELECT COUNT(*) AS n FROM sessions").fetchone()["n"]
    purchased = conn.execute(
        "SELECT COUNT(*) AS n FROM sessions WHERE outcome = 0"
    ).fetchone()["n"]
    abandoned = conn.execute(
        "SELECT COUNT(*) AS n FROM sessions WHERE outcome = 1"
    ).fetchone()["n"]

    latest_pred = conn.execute(
        """
        SELECT p.session_id, p.probability, p.risk_level
        FROM predictions p
        INNER JOIN (
            SELECT session_id, MAX(id) AS max_id
            FROM predictions
            GROUP BY session_id
        ) latest ON latest.session_id = p.session_id AND latest.max_id = p.id
        """
    ).fetchall()

    conn.close()

    high_risk = sum(1 for row in latest_pred if row["risk_level"] == "HIGH")
    avg_risk = (
        sum(row["probability"] for row in latest_pred) / len(latest_pred)
        if latest_pred
        else 0.0
    )
    decided = purchased + abandoned
    abandonment_rate = (abandoned / decided) if decided else 0.0

    return {
        "total_sessions": total,
        "completed_purchases": purchased,
        "abandoned_carts": abandoned,
        "abandonment_rate": round(abandonment_rate, 4),
        "high_risk_sessions": high_risk,
        "average_risk_score": round(avg_risk, 4),
        "data_note": "Metrics are computed from this project's SQLite database. Training used synthetic demonstration data.",
    }


def list_sessions(search="", risk="", outcome="", sort="date", order="desc"):
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT
            s.session_id,
            s.started_at,
            s.ended_at,
            s.page,
            s.cart_status,
            s.outcome,
            s.tracking_enabled,
            f.session_duration,
            f.mouse_move_count,
            f.cart_time,
            f.checkout_hesitation_score,
            p.probability,
            p.risk_level
        FROM sessions s
        LEFT JOIN behavioral_features f
            ON f.id = (
                SELECT MAX(id) FROM behavioral_features WHERE session_id = s.session_id
            )
        LEFT JOIN predictions p
            ON p.id = (
                SELECT MAX(id) FROM predictions WHERE session_id = s.session_id
            )
        ORDER BY s.started_at DESC
        """
    ).fetchall()
    conn.close()

    sessions = [dict(row) for row in rows]

    if search:
        needle = search.lower()
        sessions = [
            row
            for row in sessions
            if needle in (row["session_id"] or "").lower()
            or needle in (row["page"] or "").lower()
            or needle in (row["risk_level"] or "").lower()
        ]

    if risk:
        sessions = [row for row in sessions if (row["risk_level"] or "") == risk.upper()]

    if outcome == "purchased":
        sessions = [row for row in sessions if row["outcome"] == 0]
    elif outcome == "abandoned":
        sessions = [row for row in sessions if row["outcome"] == 1]
    elif outcome == "open":
        sessions = [row for row in sessions if row["outcome"] is None]

    reverse = order != "asc"
    sort_key = {
        "date": lambda row: row["started_at"] or "",
        "risk": lambda row: row["probability"] if row["probability"] is not None else -1,
        "duration": lambda row: row["session_duration"] or 0,
        "hesitation": lambda row: row["checkout_hesitation_score"] or 0,
    }.get(sort, lambda row: row["started_at"] or "")

    sessions.sort(key=sort_key, reverse=reverse)
    return sessions


def probability_histogram():
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT p.probability
        FROM predictions p
        INNER JOIN (
            SELECT session_id, MAX(id) AS max_id
            FROM predictions
            GROUP BY session_id
        ) latest ON latest.session_id = p.session_id AND latest.max_id = p.id
        """
    ).fetchall()
    conn.close()

    buckets = {"0-19": 0, "20-39": 0, "40-59": 0, "60-79": 0, "80-100": 0}
    for row in rows:
        pct = (row["probability"] or 0) * 100
        if pct < 20:
            buckets["0-19"] += 1
        elif pct < 40:
            buckets["20-39"] += 1
        elif pct < 60:
            buckets["40-59"] += 1
        elif pct < 80:
            buckets["60-79"] += 1
        else:
            buckets["80-100"] += 1
    return buckets


def risk_level_counts():
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT p.risk_level, COUNT(*) AS n
        FROM predictions p
        INNER JOIN (
            SELECT session_id, MAX(id) AS max_id
            FROM predictions
            GROUP BY session_id
        ) latest ON latest.session_id = p.session_id AND latest.max_id = p.id
        GROUP BY p.risk_level
        """
    ).fetchall()
    conn.close()
    counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    for row in rows:
        counts[row["risk_level"]] = row["n"]
    return counts


def latest_live_session():
    conn = get_connection()
    row = conn.execute(
        """
        SELECT
            s.session_id,
            s.started_at,
            s.updated_at,
            s.page,
            s.cart_status,
            s.outcome,
            f.session_duration,
            f.mouse_move_count,
            f.scroll_count,
            f.click_count,
            f.checkout_hesitation_score,
            f.idle_time,
            f.cart_time,
            p.probability,
            p.risk_level
        FROM sessions s
        LEFT JOIN behavioral_features f
            ON f.id = (
                SELECT MAX(id) FROM behavioral_features WHERE session_id = s.session_id
            )
        LEFT JOIN predictions p
            ON p.id = (
                SELECT MAX(id) FROM predictions WHERE session_id = s.session_id
            )
        ORDER BY s.updated_at DESC
        LIMIT 1
        """
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def _public_user(row):
    return {
        "id": row["id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "phone": row["phone"],
    }


def create_user(full_name, email, phone, password_hash):
    now = utc_now()
    conn = get_connection()
    cur = conn.execute(
        """
        INSERT INTO users (full_name, email, phone, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (full_name, email.lower(), phone, password_hash, now),
    )
    conn.commit()
    user_id = cur.lastrowid
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return _public_user(row)


def get_user_by_email(email):
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id):
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return _public_user(row) if row else None


def create_auth_token(user_id, token):
    conn = get_connection()
    conn.execute(
        "INSERT INTO auth_tokens (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, utc_now()),
    )
    conn.commit()
    conn.close()


def get_user_by_token(token):
    if not token:
        return None
    conn = get_connection()
    row = conn.execute(
        """
        SELECT users.* FROM users
        INNER JOIN auth_tokens ON auth_tokens.user_id = users.id
        WHERE auth_tokens.token = ?
        """,
        (token,),
    ).fetchone()
    conn.close()
    return _public_user(row) if row else None


def delete_auth_token(token):
    conn = get_connection()
    conn.execute("DELETE FROM auth_tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def create_order(payload):
    now = utc_now()
    conn = get_connection()
    cur = conn.execute(
        """
        INSERT INTO orders (
            user_id, session_id, full_name, email, phone, address, city, state,
            pincode, payment_method, amount, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["user_id"],
            payload.get("session_id"),
            payload["full_name"],
            payload["email"],
            payload["phone"],
            payload["address"],
            payload["city"],
            payload["state"],
            payload["pincode"],
            payload["payment_method"],
            payload["amount"],
            now,
        ),
    )
    conn.commit()
    order_id = cur.lastrowid
    row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    conn.close()
    return dict(row)
