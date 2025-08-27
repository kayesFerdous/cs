import { NextRequest, NextResponse } from "next/server";
import {
  isRateLimitingEnabled,
  setRateLimitingEnabled,
} from "../../../lib/rate-limiter";

export async function GET() {
  return NextResponse.json({
    rateLimitingEnabled: isRateLimitingEnabled(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { detail: "enabled must be a boolean" },
        { status: 400 }
      );
    }

    setRateLimitingEnabled(enabled);

    return NextResponse.json({
      rateLimitingEnabled: isRateLimitingEnabled(),
      message: `Rate limiting ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }
}
