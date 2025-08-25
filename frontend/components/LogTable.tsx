"use client";

function classColor(cls: string) {
  if (cls === "High Threat") return "text-red-400";
  if (cls === "Suspicious") return "text-yellow-400";
  return "text-slate-300";
}

export function LogTable({ logs }: { logs: any[] }) {
  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded p-4">
      <h2 className="font-semibold mb-2">Recent Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Classification</th>
              <th className="py-2 pr-4">Sensitivity</th>
              <th className="py-2 pr-4">Safe</th>
              <th className="py-2 pr-4">Payload</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-slate-900/60">
                <td className="py-2 pr-4 whitespace-nowrap text-slate-400">{l.timestamp}</td>
                <td className={`py-2 pr-4 font-medium ${classColor(l.classification)}`}>{l.classification}</td>
                <td className="py-2 pr-4 text-slate-400">{l.sensitivity}</td>
                <td className="py-2 pr-4 text-slate-400">{l.safe_mode ? "Yes" : "No"}</td>
                <td className="py-2 pr-4">
                  <div className="line-clamp-2 break-all text-slate-200 max-w-[640px]">{l.payload}</div>
                  {Array.isArray(l.rule_hits) && l.rule_hits.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1">Rules: {l.rule_hits.length}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
