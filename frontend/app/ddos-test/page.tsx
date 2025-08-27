"use client";

import { useEffect, useRef, useState } from "react";

export default function DDoSTestPage() {
  const [attacksPerMinute, setAttacksPerMinute] = useState(60);
  const [isAttacking, setIsAttacking] = useState(false);
  const [rateLimitingEnabled, setRateLimitingEnabled] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [attackStats, setAttackStats] = useState({
    sent: 0,
    successful: 0,
    rateLimited: 0,
    errors: 0,
  });

  // Use useRef to store the interval reference
  // Stores the interval timer so you can stop the attack when needed.
  const attackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial rate limiting status
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/rate-limiting");
        const data = await response.json();
        setRateLimitingEnabled(data.rateLimitingEnabled);
      } catch (error) {
        console.error("Error loading rate limiting status:", error);
      }
    })();
  }, []);

  const startAttack = async () => {
    setIsAttacking(true);
    setResults([]);
    setAttackStats({ sent: 0, successful: 0, rateLimited: 0, errors: 0 });

    const interval = 60000 / attacksPerMinute; // Convert to milliseconds
    let attackCount = 0;
    const maxAttacks = attacksPerMinute; // Run for 1 minute

    const intervalId = setInterval(async () => {
      // Check if we should stop the attack
      if (attackCount >= maxAttacks) {
        clearInterval(intervalId);
        attackIntervalRef.current = null;
        setIsAttacking(false);
        return;
      }

      attackCount++;

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: `DDoS Test Payload #${attackCount} - ${new Date().toISOString()}`,
          }),
        });

        const result = await response.json();
        const timestamp = new Date().toISOString();

        setAttackStats((prev) => ({
          ...prev,
          sent: prev.sent + 1,
          successful: response.ok ? prev.successful + 1 : prev.successful,
          rateLimited:
            response.status === 429 ? prev.rateLimited + 1 : prev.rateLimited,
          errors:
            !response.ok && response.status !== 429
              ? prev.errors + 1
              : prev.errors,
        }));

        setResults((prev) =>
          [
            ...prev,
            {
              id: attackCount,
              timestamp,
              status: response.status,
              success: response.ok,
              rateLimited: response.status === 429,
              response: result,
            },
          ].slice(-50)
        ); // Keep only last 50 results
      } catch (error) {
        setAttackStats((prev) => ({
          ...prev,
          sent: prev.sent + 1,
          errors: prev.errors + 1,
        }));

        setResults((prev) =>
          [
            ...prev,
            {
              id: attackCount,
              timestamp: new Date().toISOString(),
              status: "ERROR",
              success: false,
              rateLimited: false,
              response: {
                error: error instanceof Error ? error.message : "Unknown error",
              },
            },
          ].slice(-50)
        );
      }
    }, interval);

    // Store the interval reference so we can clear it later
    attackIntervalRef.current = intervalId;
  };

  const stopAttack = () => {
    setIsAttacking(false);
    // Clear the interval immediately
    if (attackIntervalRef.current) {
      clearInterval(attackIntervalRef.current);
      attackIntervalRef.current = null;
    }
  };

  const toggleRateLimiting = async () => {
    try {
      const response = await fetch("/api/rate-limiting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !rateLimitingEnabled,
        }),
      });

      const data = await response.json();
      setRateLimitingEnabled(data.rateLimitingEnabled);
    } catch (error) {
      console.error("Error toggling rate limiting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">DDoS Attack Simulator</h1>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Configuration */}
        <div className="bg-slate-900/50 border border-slate-800 rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Attack Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Attacks per Minute
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={attacksPerMinute}
                onChange={(e) =>
                  setAttacksPerMinute(parseInt(e.target.value) || 60)
                }
                disabled={isAttacking}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={toggleRateLimiting}
                disabled={isAttacking}
                className={`px-4 py-2 rounded text-sm ${
                  rateLimitingEnabled
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Rate Limiting: {rateLimitingEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex items-end">
              {!isAttacking ? (
                <button
                  onClick={startAttack}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                >
                  Start Attack
                </button>
              ) : (
                <button
                  onClick={stopAttack}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 rounded text-sm font-semibold"
                >
                  ⏹ Stop Attack
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
            <div className="text-2xl font-bold text-blue-400">
              {attackStats.sent}
            </div>
            <div className="text-sm text-slate-400">Requests Sent</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
            <div className="text-2xl font-bold text-green-400">
              {attackStats.successful}
            </div>
            <div className="text-sm text-slate-400">Successful</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {attackStats.rateLimited}
            </div>
            <div className="text-sm text-slate-400">Rate Limited</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
            <div className="text-2xl font-bold text-red-400">
              {attackStats.errors}
            </div>
            <div className="text-sm text-slate-400">Errors</div>
          </div>
        </div>

        {/* Attack Status */}
        {isAttacking && (
          <div className="bg-red-900/20 border border-red-800 rounded p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-300">
                  Attack in progress... ({attackStats.sent}/{attacksPerMinute}{" "}
                  requests)
                </span>
              </div>
              <button
                onClick={stopAttack}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold"
              >
                ⏹ STOP NOW
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-slate-900/50 border border-slate-800 rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Results</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Response</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-slate-800">
                    <td className="p-2">{result.id}</td>
                    <td className="p-2 text-slate-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          result.success
                            ? "bg-green-900 text-green-300"
                            : result.rateLimited
                            ? "bg-yellow-900 text-yellow-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {result.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <pre className="text-xs text-slate-400 max-w-xs overflow-hidden">
                        {JSON.stringify(result.response, null, 2).slice(0, 100)}
                        ...
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {results.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No results yet. Start an attack to see results.
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-900/20 border border-blue-800 rounded p-4">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• This simulator sends requests to the /api/scan endpoint</li>
            <li>
              • Rate limiting can be toggled on/off using the button above
            </li>
            <li>
              • You can test how the system handles different attack intensities
            </li>
            <li>• Green = successful, Yellow = rate limited, Red = error</li>
            <li>
              •{" "}
              <strong>
                Use the Stop button to immediately halt the attack
              </strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
