import { NextResponse } from "next/server";

import type { AdaptiveSchemaType } from "@/lib/bank-parsers/types";
import {
  listParserFeedbackEntries,
  recordParserFeedback,
} from "@/lib/parser-learning";

function isSchemaHint(value: unknown): value is AdaptiveSchemaType {
  return (
    value === "directional-balance" ||
    value === "fee-balance" ||
    value === "signed-balance"
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const layoutSignature = searchParams.get("layoutSignature");

    if (!layoutSignature) {
      return NextResponse.json(
        { error: "layoutSignature is required." },
        { status: 400 },
      );
    }

    const entries = await listParserFeedbackEntries(layoutSignature);

    return NextResponse.json({
      layoutSignature,
      feedbackCount: entries.length,
      entries,
    });
  } catch (error) {
    const detail =
      error instanceof Error && process.env.NODE_ENV !== "production"
        ? ` ${error.message}`
        : "";

    return NextResponse.json(
      { error: `Feedback could not be loaded.${detail}` },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const layoutSignature =
      typeof body.layoutSignature === "string" ? body.layoutSignature.trim() : "";
    const parserId = typeof body.parserId === "string" ? body.parserId.trim() : "";
    const accepted = typeof body.accepted === "boolean" ? body.accepted : null;
    const preferredParserId =
      typeof body.preferredParserId === "string"
        ? body.preferredParserId.trim() || null
        : null;
    const bankName =
      typeof body.bankName === "string" ? body.bankName.trim() || null : null;
    const detectedBank =
      typeof body.detectedBank === "string"
        ? body.detectedBank.trim() || null
        : null;
    const notes =
      typeof body.notes === "string" ? body.notes.trim() || null : null;
    const schemaHint = isSchemaHint(body.schemaHint) ? body.schemaHint : null;

    if (!layoutSignature || !parserId || accepted === null) {
      return NextResponse.json(
        {
          error:
            "layoutSignature, parserId, and accepted are required.",
        },
        { status: 400 },
      );
    }

    const learningProfile = await recordParserFeedback({
      layoutSignature,
      parserId,
      detectedBank,
      accepted,
      preferredParserId,
      bankName,
      schemaHint,
      notes,
    });

    return NextResponse.json({
      learningProfile,
    });
  } catch (error) {
    const detail =
      error instanceof Error && process.env.NODE_ENV !== "production"
        ? ` ${error.message}`
        : "";

    return NextResponse.json(
      { error: `Feedback could not be stored.${detail}` },
      { status: 500 },
    );
  }
}
