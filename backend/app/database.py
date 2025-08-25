from __future__ import annotations

import json
import os
import sqlite3
import threading
from typing import Any, Dict, List

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "webshield.db")
DB_PATH = os.path.normpath(DB_PATH)

_os_lock = threading.RLock()


def _ensure_dir() -> None:
    data_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    _ensure_dir()
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _os_lock:
        conn = get_connection()
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    classification TEXT NOT NULL,
                    rule_hits TEXT NOT NULL,
                    ml_score REAL,
                    sensitivity TEXT NOT NULL,
                    safe_mode INTEGER NOT NULL
                );
                """
            )
            conn.commit()
        finally:
            conn.close()


def insert_log(entry: Dict[str, Any]) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO logs (timestamp, payload, classification, rule_hits, ml_score, sensitivity, safe_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry["timestamp"],
                entry["payload"],
                entry["classification"],
                json.dumps(entry.get("rule_hits", [])),
                entry.get("ml_score"),
                entry["sensitivity"],
                1 if entry["safe_mode"] else 0,
            ),
        )
        conn.commit()
        return cur.lastrowid or 0
    finally:
        conn.close()


def fetch_logs(limit: int = 200) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.execute(
            "SELECT id, timestamp, payload, classification, rule_hits, ml_score, sensitivity, safe_mode FROM logs ORDER BY id DESC LIMIT ?",
            (limit,),
        )
        rows = cur.fetchall()
        results: List[Dict[str, Any]] = []
        for r in rows:
            results.append(
                {
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "payload": r["payload"],
                    "classification": r["classification"],
                    "rule_hits": json.loads(r["rule_hits"]) if r["rule_hits"] else [],
                    "ml_score": r["ml_score"],
                    "sensitivity": r["sensitivity"],
                    "safe_mode": bool(r["safe_mode"]),
                }
            )
        return results
    finally:
        conn.close()
