const BASE = '';

async function handle(r: Response) {
  const text = await r.text();
  if (!r.ok) {
    const clipped = text.slice(0, 300);
    throw new Error(`HTTP ${r.status}: ${clipped || 'No body'}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
}

export async function fetchConfig() {
  return handle(await fetch(`${BASE}/api/config`, { cache: "no-store" }));
}

export async function setConfig(payload: { safe_mode?: boolean; sensitivity?: "Low" | "Medium" | "Paranoid" }) {
  return handle(await fetch(`${BASE}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function fetchLogs(limit = 200) {
  return handle(await fetch(`${BASE}/api/logs?limit=${limit}`, { cache: "no-store" }));
}

export async function submitPayload(payload: string) {
  return handle(await fetch(`${BASE}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload }),
  }));
}
