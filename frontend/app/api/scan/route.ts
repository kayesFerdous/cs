export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "../../../lib/config";
import { insertLog } from "../../../lib/database";
import { predictScore } from "../../../lib/ml-model";
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
    const [ml_score, ml_label] = predictScore(payload);

    // Combine decisions: High Threat if either says so; Suspicious if either says Suspicious
    let final_class = rule_severity;
    if (ml_label) {
      if (ml_label === "High Threat" || final_class === "High Threat") {
        final_class = "High Threat";
      } else if (ml_label === "Suspicious" || final_class === "Suspicious") {
        final_class = "Suspicious";
      }
    }

    const action =
      safe_mode && final_class === "High Threat" ? "logged-only" : "allowed";

    // Log entry
    const now = new Date().toISOString();
    const entry = {
      timestamp: now,
      payload,
      classification: final_class,
      rule_hits,
      ml_score,
      sensitivity,
      safe_mode,
    };

    const newId = insertLog(entry);

    return NextResponse.json({
      classification: final_class,
      rule_hits,
      ml_score,
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
