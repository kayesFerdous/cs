"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useMemo } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function TrendChart({ logs }: { logs: any[] }) {
  const data = useMemo(() => {
    const points: { t: string; clean: number; suspicious: number; high: number }[] = [];
    const buckets: Record<string, { clean: number; suspicious: number; high: number }> = {};
    for (const l of [...logs].reverse()) {
      const minute = l.timestamp?.slice(0, 16) ?? ""; // YYYY-MM-DDTHH:MM
      if (!buckets[minute]) buckets[minute] = { clean: 0, suspicious: 0, high: 0 };
      if (l.classification === "High Threat") buckets[minute].high++;
      else if (l.classification === "Suspicious") buckets[minute].suspicious++;
      else buckets[minute].clean++;
    }
    Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .forEach(([t, v]) => points.push({ t, clean: v.clean, suspicious: v.suspicious, high: v.high }));

    return {
      labels: points.map((p) => p.t.replace("T", " ")),
      datasets: [
        {
          label: "High Threat",
          data: points.map((p) => p.high),
          borderColor: "#f87171",
          backgroundColor: "#ef444433",
          tension: 0.3,
        },
        {
          label: "Suspicious",
          data: points.map((p) => p.suspicious),
          borderColor: "#fbbf24",
          backgroundColor: "#f59e0b33",
          tension: 0.3,
        },
        {
          label: "Clean",
          data: points.map((p) => p.clean),
          borderColor: "#94a3b8",
          backgroundColor: "#64748b33",
          tension: 0.3,
        },
      ],
    };
  }, [logs]);

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded p-4">
      <h2 className="font-semibold mb-2">Threat Trend</h2>
      <div className="h-64">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#cbd5e1" } },
              tooltip: { mode: "index", intersect: false },
            },
            scales: {
              x: { ticks: { color: "#94a3b8" }, grid: { color: "#0f172a" } },
              y: { ticks: { color: "#94a3b8" }, grid: { color: "#0f172a" } },
            },
          }}
        />
      </div>
    </section>
  );
}
