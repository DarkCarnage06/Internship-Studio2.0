import { NextResponse } from "next/server";
import { retrieveTopChunks, calculateOverallMatchScore } from "@/lib/retrieval";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId, jobDescription } = body as { resumeId?: string; jobDescription?: string };

    if (!resumeId || typeof resumeId !== "string") {
      return NextResponse.json({ error: "A valid resumeId is required." }, { status: 400 });
    }

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json({ error: "A job description is required." }, { status: 400 });
    }

    const existingResume = await sql`
      SELECT id
      FROM resumes
      WHERE id = ${resumeId}
      LIMIT 1
    `;

    if (!Array.isArray(existingResume) || existingResume.length === 0) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const retrievedChunks = await retrieveTopChunks(resumeId, jobDescription, 5);
    const matchScore = calculateOverallMatchScore(retrievedChunks);

    return NextResponse.json({ matchScore, retrievedChunks });
  } catch (error) {
    console.error("Match analysis error:", error);
    return NextResponse.json({ error: "Unable to analyze the match." }, { status: 500 });
  }
}
