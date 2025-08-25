"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchConfig, setConfig, submitPayload, fetchLogs } from "../lib/api";
import { LogTable } from "../components/LogTable";
import { Controls } from "../components/Controls";
import { Alerts } from "../components/Alerts";
import { TrendChart } from "../components/TrendChart";

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || "ws://localhost:8000";

export default function Page() {
  const [payload, setPayload] = useState("");
  const [safeMode, setSafeMode] = useState(true);
  const [sensitivity, setSensitivity] = useState<"Low" | "Medium" | "Paranoid">("Medium");
  const [logs, setLogs] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    (async () => {
      const cfg = await fetchConfig();
      setSafeMode(cfg.safe_mode);
      setSensitivity(cfg.sensitivity);
      const existing = await fetchLogs();
      setLogs(existing);
    })();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/logs`);
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === "log" && msg?.data) {
          setLogs((prev) => [msg.data, ...prev].slice(0, 200));
        }
      } catch {}
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return () => {
      ws.close();
    };
  }, []);

  const threatCounts = useMemo(() => {
    const counts = { Clean: 0, Suspicious: 0, "High Threat": 0 } as Record<string, number>;
    logs.forEach((l) => {
      counts[l.classification] = (counts[l.classification] || 0) + 1;
    });
    return counts;
  }, [logs]);

  async function onScan() {
    if (!payload.trim()) return;
    await submitPayload(payload);
    setPayload("");
  }

  async function onUpdateConfig(nextSafe: boolean, nextSensitivity: "Low" | "Medium" | "Paranoid") {
    const updated = await setConfig({ safe_mode: nextSafe, sensitivity: nextSensitivity });
    setSafeMode(updated.safe_mode);
    setSensitivity(updated.sensitivity);
  }

  return (
    <main className="space-y-6">
      <Controls
        safeMode={safeMode}
        sensitivity={sensitivity}
        onChange={onUpdateConfig}
      />

      <section className="bg-slate-900/50 border border-slate-800 rounded p-4">
        <h2 className="font-semibold mb-2">Scan Payload</h2>
        <div className="flex gap-2">
          <textarea
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm"
            rows={3}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste a payload to scan"
          />
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={onScan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
          >
            Scan
          </button>
        </div>
      </section>

      <Alerts counts={threatCounts} />

      <TrendChart logs={logs} />

      <LogTable logs={logs} />
    </main>
  );
}
