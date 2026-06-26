import { NextResponse } from "next/server";
import { parsePdfBuffer, chunkResume } from "@/lib/resume-parser";
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

    const arrayBuffer = await file.arrayBuffer();
    const rawText = await parsePdfBuffer(Buffer.from(arrayBuffer));
    const chunks = chunkResume(rawText);
    const parsedResume: ParsedResume = { rawText, chunks };

    return NextResponse.json(parsedResume);
  } catch (error) {
    return NextResponse.json({ error: "Unable to parse 