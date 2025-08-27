"use client";

import { useEffect, useMemo, useState } from "react";
import { Alerts } from "../components/Alerts";
import { Controls } from "../components/Controls";
import { LogTable } from "../components/LogTable";
import { TrendChart } from "../components/TrendChart";
import { fetchConfig, fetchLogs, setConfig, submitPayload } from "../lib/api";

export default function Page() {
  const [payload, setPayload] = useState("");
  const [safeMode, setSafeMode] = useState(true);
  const [sensitivity, setSensitivity] = useState<"Low" | "Medium" | "Paranoid">(
    "Medium"
  );
  const [logs, setLogs] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    (async () => {
      const cfg = await fetchConfig();
      setSafeMode(cfg.safe_mode);
      setSensitivity(cfg.sensitivity);
      const existing = await fetchLogs();
      setLogs(existing);
    })();
  }, []);

  const threatCounts = useMemo(() => {
    const counts = { Clean: 0, Suspicious: 0, "High Threat": 0 } as Record<
      string,
      number
    >;
    logs.forEach((l) => {
      counts[l.classification] = (counts[l.classification] || 0) + 1;
    });
    return counts;
  }, [logs]);

  async function onScan() {
    if (!payload.trim()) return;
    await submitPayload(payload);
    setPayload("");
    // Refresh logs immediately after scanning
    try {
      const freshLogs = await fetchLogs();
      setLogs(freshLogs);
    } catch (error) {
      console.error("Error refreshing logs:", error);
    }
  }

  async function onUpdateConfig(
    nextSafe: boolean,
    nextSensitivity: "Low" | "Medium" | "Paranoid"
  ) {
    const updated = await setConfig({
      safe_mode: nextSafe,
      sensitivity: nextSensitivity,
    });
    setSafeMode(updated.safe_mode);
    setSensitivity(updated.sensitivity);
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CyberForge WebShield</h1>
        <div className="flex space-x-2">
          <a
            href="/ddos-test"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
          >
            DDoS Test
          </a>
          <button
            onClick={async () => {
              const freshLogs = await fetchLogs();
              setLogs(freshLogs);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

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
