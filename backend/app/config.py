from __future__ import annotations

import threading
from typing import Literal

Sensitivity = Literal["Low", "Medium", "Paranoid"]


class _Config:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._safe_mode: bool = True
        self._sensitivity: Sensitivity = "Medium"

    def get(self) -> tuple[bool, Sensitivity]:
        with self._lock:
            return self._safe_mode, self._sensitivity

    def set(self, *, safe_mode: bool | None = None, sensitivity: Sensitivity | None = None) -> tuple[bool, Sensitivity]:
        with self._lock:
            if safe_mode is not None:
                self._safe_mode = bool(safe_mode)
            if sensitivity is not None:
                self._sensitivity = sensitivity
            return self._safe_mode, self._sensitivity


_config = _Config()


def get_config() -> tuple[bool, Sensitivity]:
    return _config.get()


def update_config(*, safe_mode: bool | None = None, sensitivity: Sensitivity | None = None) -> tuple[bool, Sensitivity]:
    return _config.set(safe_mode=safe_mode, sensitivity=sensitivity)
