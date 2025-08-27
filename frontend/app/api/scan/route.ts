export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "../../../lib/config";
import { insertLog } from "../../../lib/database";
import {
  createRateLimitResponse,
  getClientId,
  rateLimiters,
} from "../../../lib/rate-limiter";
import { scanRules } from "../../../lib/rules";

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimitResult = rateLimiters.scan.check(clientId);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.retryAfter!,
      "30 per minute"
    );
  }

  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload || typeof payload !== "string") {
      return NextResponse.json(
        { detail: "Payload is required and must be a string" },
        { status: 400 }
      );
    }

    const [safe_mode, sensitivity] = getConfig();
    const [rule_hits, rule_severity] = scanRules(payload, sensitivity);

    // Use rule-based classification only (simplified)
    const final_class = rule_severity;

    const action =
      safe_mode && final_class === "High Threat" ? "logged-only" : "allowed";

    // Log entry
    const now = new Date().toISOString();
    const entry = {
      timestamp: now,
      payload,
      classification: final_class,
      rule_hits,
      ml_score: null,
      sensitivity,
      safe_mode,
    };

    const newId = insertLog(entry);

    return NextResponse.json({
      classification: final_class,
      rule_hits,
      ml_score: null,
      sensitivity,
      safe_mode,
      action,
    });
  } catch (error) {
    console.error("Error in scan endpoint:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
