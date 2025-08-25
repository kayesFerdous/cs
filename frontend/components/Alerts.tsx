"use client";

export function Alerts({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
        <div className="text-xs text-slate-400">Clean</div>
        <div className="text-2xl font-semibold text-slate-200">{counts["Clean"] ?? 0}</div>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
        <div className="text-xs text-slate-400">Suspicious</div>
        <div className="text-2xl font-semibold text-yellow-400">{counts["Suspicious"] ?? 0}</div>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
        <div className="text-xs text-slate-400">High Threat</div>
        <div className="text-2xl font-semibold text-red-400">{counts["High Threat"] ?? 0}</div>
      </div>
    </section>
  );
}
