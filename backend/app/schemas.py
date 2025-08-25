from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    payload: str = Field(..., description="Arbitrary payload string to scan")


class ScanResponse(BaseModel):
    classification: str
    rule_hits: List[str]
    ml_score: Optional[float] = None
    sensitivity: str
    safe_mode: bool
    action: str


class LogEntry(BaseModel):
    id: int
    timestamp: str
    payload: str
    classification: str
    rule_hits: List[str]
    ml_score: Optional[float]
    sensitivity: str
    safe_mode: bool


class ConfigPayload(BaseModel):
    sensitivity: Optional[str] = Field(None, description="One of: Low, Medium, Paranoid")
    safe_mode: Optional[bool] = None


class ConfigResponse(BaseModel):
    sensitivity: str
    safe_mode: bool
