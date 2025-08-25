import datetime as dt
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .schemas import ScanRequest, ScanResponse, LogEntry, ConfigPayload, ConfigResponse
from .config import get_config, update_config
from . import database
from .rules import scan_rules
from .ml_model import predict_score
from .websocket_manager import manager

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

# Custom rate limit exception handler
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # Extract retry time from the exception detail (e.g., "429: 20 per 1 minute")
    detail = str(exc)
    retry_after = 60  # Default to 60 seconds
    
    # Try to extract time from the detail string
    if "minute" in detail:
        retry_after = 60
    elif "hour" in detail:
        retry_after = 3600
    elif "second" in detail:
        retry_after = 1
    
    response = JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {detail}",
            "retry_after": retry_after,
            "message": "Too many requests. Please try again later."
        }
    )
    response.headers["Retry-After"] = str(retry_after)
    return response

app = FastAPI(title="CyberForge WebShield", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    database.init_db()
    # load_model()


@app.get("/health")
@limiter.limit("100/minute")
def health(request: Request) -> dict:
    return {"status": "ok"}


@app.get("/rate-limit-stats")
@limiter.limit("30/minute")
def get_rate_limit_stats(request: Request) -> dict:
    """Get current rate limiting statistics."""
    return {
        "message": "Rate limiting is active using slowapi",
        "limits": {
            "health": "100 per minute",
            "config": "30 per minute (GET), 10 per minute (POST)",
            "logs": "50 per minute",
            "scan": "20 per minute"
        },
        "note": "Detailed statistics not available with slowapi"
    }


@app.get("/config", response_model=ConfigResponse)
@limiter.limit("30/minute")
def get_current_config(request: Request) -> ConfigResponse:
    safe_mode, sensitivity = get_config()
    return ConfigResponse(sensitivity=sensitivity, safe_mode=safe_mode)


@app.post("/config", response_model=ConfigResponse)
@limiter.limit("10/minute")
def set_config(request: Request, cfg: ConfigPayload) -> ConfigResponse:
    sensitivity = cfg.sensitivity
    if sensitivity is not None:
        sensitivity = sensitivity.capitalize()
        if sensitivity not in ("Low", "Medium", "Paranoid"):
            raise HTTPException(status_code=400, detail="Invalid sensitivity")
    safe_mode, sensitivity_now = update_config(
        safe_mode=cfg.safe_mode,
        sensitivity=sensitivity,  # type: ignore[arg-type]
    )
    return ConfigResponse(sensitivity=sensitivity_now, safe_mode=safe_mode)


@app.get("/logs", response_model=List[LogEntry])
@limiter.limit("50/minute")
def get_logs(request: Request, limit: int = 200) -> List[LogEntry]:
    rows = database.fetch_logs(limit=limit)
    # Convert to pydantic models
    return [LogEntry(**r) for r in rows]


@app.post("/scan", response_model=ScanResponse)
@limiter.limit("20/minute")
def scan(request: Request, req: ScanRequest, background_tasks: BackgroundTasks) -> ScanResponse:
    safe_mode, sensitivity = get_config()

    rule_hits, rule_severity = scan_rules(req.payload, sensitivity)

    ml_score, ml_label = predict_score(req.payload)

    # Combine decisions: High Threat if either says so; Suspicious if either says Suspicious
    final_class = rule_severity
    if ml_label:
        if ml_label == "High Threat" or final_class == "High Threat":
            final_class = "High Threat"
        elif ml_label == "Suspicious" or final_class == "Suspicious":
            final_class = "Suspicious"
        else:
            final_class = final_class

    action = "allowed"
    if safe_mode and final_class == "High Threat":
        action = "logged-only"

    # Log entry
    now = dt.datetime.utcnow().isoformat() + "Z"
    entry = {
        "timestamp": now,
        "payload": req.payload,
        "classification": final_class,
        "rule_hits": rule_hits,
        "ml_score": ml_score,
        "sensitivity": sensitivity,
        "safe_mode": safe_mode,
    }
    new_id = database.insert_log(entry)
    entry_with_id = {"id": new_id, **entry}

    # Realtime broadcast via background task (safe from sync route)
    background_tasks.add_task(manager.broadcast_json, {"type": "log", "data": entry_with_id})

    return ScanResponse(
        classification=final_class,
        rule_hits=rule_hits,
        ml_score=ml_score,
        sensitivity=sensitivity,
        safe_mode=safe_mode,
        action=action,
    )


@app.websocket("/ws/logs")
async def ws_logs(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Keep alive without requiring client messages
        import asyncio
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)
