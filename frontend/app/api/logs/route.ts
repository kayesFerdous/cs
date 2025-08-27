export const dynamic = "force-dynamic";

const BACKEND_BASE = process.env.BACKEND_BASE || "http://localhost:8000";

import { NextRequest, NextResponse } from "next/server";
import { fetchLogs } from "../../../lib/database";
import {
  createRateLimitResponse,
  getClientId,
  rateLimiters,
} from "../../../lib/rate-limiter";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimitResult = rateLimiters.logs.check(clientId);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.retryAfter!,
      "50 per minute"
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "200", 10);

    const logs = fetchLogs(limit);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
