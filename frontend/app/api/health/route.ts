import { NextRequest, NextResponse } from "next/server";
import {
  createRateLimitResponse,
  getClientId,
  rateLimiters,
} from "../../../lib/rate-limiter";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimitResult = rateLimiters.health.check(clientId);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.retryAfter!,
      "100 per minute"
    );
  }

  return NextResponse.json({ status: "ok" });
}
