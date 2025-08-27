export const dynamic = "force-dynamic";

const BACKEND_BASE = process.env.BACKEND_BASE || "http://localhost:8000";

import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig, type Sensitivity } from "../../../lib/config";
import {
  createRateLimitResponse,
  getClientId,
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

  const [safe_mode, sensitivity] = getConfig();
  return NextResponse.json({ sensitivity, safe_mode });
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimitResult = rateLimiters.configPost.check(clientId);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.retryAfter!,
      "10 per minute"
    );
  }

  try {
    const body = await request.json();
    const { sensitivity, safe_mode } = body;

    // Validate sensitivity if provided
    if (sensitivity !== undefined) {
      const normalizedSensitivity =
        sensitivity.charAt(0).toUpperCase() +
        sensitivity.slice(1).toLowerCase();
      if (!["Low", "Medium", "Paranoid"].includes(normalizedSensitivity)) {
        return NextResponse.json(
          { detail: "Invalid sensitivity" },
          { status: 400 }
        );
      }
    }

    const [updatedSafeMode, updatedSensitivity] = updateConfig({
      safe_mode,
      sensitivity: sensitivity
        ? ((sensitivity.charAt(0).toUpperCase() +
            sensitivity.slice(1).toLowerCase()) as Sensitivity)
        : undefined,
    });

    return NextResponse.json({
      sensitivity: updatedSensitivity,
      safe_mode: updatedSafeMode,
    });
  } catch (error) {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }
}
