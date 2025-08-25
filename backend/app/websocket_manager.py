from __future__ import annotations

import asyncio
from typing import Set
from starlette.websockets import WebSocket


class WebsocketManager:
    def __init__(self) -> None:
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast_json(self, data) -> None:
        async with self._lock:
            to_remove = []
            for connection in list(self.active_connections):
                try:
                    await connection.send_json(data)
                except Exception:
                    to_remove.append(connection)
            for c in to_remove:
                if c in self.active_connections:
                    self.active_connections.remove(c)


manager = WebsocketManager()
