export const dynamic = "force-dynamic";

const BACKEND_BASE = process.env.BACKEND_BASE || "http://localhost:8000";

export async function GET() {
  try {
    const r = await fetch(`${BACKEND_BASE}/config`, { cache: "no-store" });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ detail: e?.message || "Proxy error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch(`${BACKEND_BASE}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ detail: e?.message || "Proxy error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
