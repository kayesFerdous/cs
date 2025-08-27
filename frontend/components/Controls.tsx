"use client";

export function Controls({
  safeMode,
  sensitivity,
  onChange,
}: {
  safeMode: boolean;
  sensitivity: "Low" | "Medium" | "Paranoid";
  onChange: (safe: boolean, sensitivity: "Low" | "Medium" | "Paranoid") => void;
}) {
  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Controls</h2>
          <p className="text-xs text-slate-400">
            Safe Mode prevents execution of high-risk requests.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="size-4"
            checked={safeMode}
            onChange={(e) => onChange(e.target.checked, sensitivity)}
          />
          <span className="text-sm">Safe Mode</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Sensitivity:</span>
          <select
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm"
            value={sensitivity}
            onChange={(e) => onChange(safeMode, e.target.value as any)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="Paranoid">Paranoid</option>
          </select>
        </div>
      </div>
    </section>
  );
}
