# CyberForge WebShield

Defensive cybersecurity project with a FastAPI backend and Next.js 13+ frontend (TailwindCSS). Focuses on payload scanning, rule-based and optional AI/ML classification, Safe Mode controls, and a real-time dashboard.

## Stack
- Backend: FastAPI, Pydantic v2, Uvicorn, SQLite (built-in), optional TensorFlow/Keras
- Frontend: Next.js 13 (App Router), React, TypeScript, TailwindCSS, Chart.js

## Quick Start

### 1) Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend will run at `http://localhost:8000`.

### 2) Frontend
```bash
cd frontend
pnpm install || npm install || yarn
pnpm dev || npm run dev || yarn dev
```
Frontend will run at `http://localhost:3000`.

## Features
- Rule-based detection for common XSS and SQLi patterns
- Optional AI/ML classification (if TensorFlow/Keras available); otherwise heuristic fallback
- Configurable Safe Mode and Sensitivity (Low, Medium, Paranoid)
- Real-time logs via WebSocket stream
- Dashboard with live table, alerts, controls, and trend chart

## Project Structure
```
backend/
  app/
    main.py
    config.py
    database.py
    rules.py
    ml_model.py
    schemas.py
    websocket_manager.py
  requirements.txt
frontend/
  app/
  components/
  lib/
  public/
  package.json
  tailwind.config.js
  postcss.config.js
  tsconfig.json
  next.config.js
```

## Notes
- TensorFlow is optional and not pinned in requirements due to size. If you have a model, place it at `backend/models/webshield_model.h5`.
- CORS is enabled for `http://localhost:3000`.
- Logs are stored in SQLite at `backend/data/webshield.db`.

## Security
This project is strictly defensive. No offensive tooling is included.
