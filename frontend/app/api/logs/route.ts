export const dynamic = "force-dynamic";

const BACKEND_BASE = process.env.BACKEND_BASE || "http://localhost:8000";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") || "200";
    const r = await fetch(`${BACKEND_BASE}/logs?limit=${encodeURIComponent(limit)}`, {
      method: "GET",
      cache: "no-store",
    });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ detail: e?.message || "Proxy error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
