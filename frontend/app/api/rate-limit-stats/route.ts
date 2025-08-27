import { NextRequest, NextResponse } from "next/server";
import {
  createRateLimitResponse,
  getClientId,
  isRateLimitingEnabled,
  rateLimiters,
} from "../../../lib/rate-limiter";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimitResult = rateLimiters.config.check(clientId);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.retryAfter!,
      "30 per minute"
    );
  }

  return NextResponse.json({
    message: "Rate limiting system status",
    enabled: isRateLimitingEnabled(),
    limits: {
      health: "100 per minute",
      config: "30 per minute (GET), 10 per minute (POST)",
      logs: "50 per minute",
      scan: "20 per minute",
    },
    note: isRateLimitingEnabled()
      ? "Rate limiting is currently ACTIVE"
      : "Rate limiting is currently DISABLED",
  });
}
