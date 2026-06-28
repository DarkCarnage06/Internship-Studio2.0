import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { parsePdfBuffer, chunkResume } from "@/lib/resume-parser";
import { generateEmbeddings } from "@/lib/embeddings";
import { sql } from "@/lib/db";
import type { ParsedResume } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF resumes are supported." }, { status: 400 });
    }

    // Parse resume and chunk content
    const arrayBuffer = await file.arrayBuffer();
    const rawText = await parsePdfBuffer(Buffer.from(arrayBuffer));
    const chunks = chunkResume(rawText);

    // Generate embeddings for all chunks
    const chunkContents = chunks.map((chunk) => chunk.content);
    const embeddings = await generateEmbeddings(chunkContents, "document");

    // Generate unique resume ID
    const resumeId = nanoid();

    // Insert resume into database
    await sql`
      INSERT INTO resumes (id, raw_text)
      VALUES (${resumeId}, ${rawText})
    `;

    // Insert chunks with embeddings into database
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const embeddingString = `[${embedding.join(",")}]`;

      await sql`
        INSERT INTO resume_chunks (id, resume_id, section, content, embedding)
        VALUES (${chunk.id}, ${resumeId}, ${chunk.section}, ${chunk.content}, ${embeddingString}::vector)
      `;
    }

    // Add embeddings to chunks for response
    const chunksWithEmbeddings = chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: embeddings[idx],
    }));

    const parsedResume: ParsedResume = { rawText, chunks: chunksWithEmbeddings };

    return NextResponse.json({ resumeId, ...parsedResume });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Unable to process resume." }, { status: 500 });
  }
}
