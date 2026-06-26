import pdf from "pdf-parse";
import { nanoid } from "nanoid";
import type { ResumeChunk } from "@/lib/types";

const SECTION_PATTERNS: Array<{ regex: RegExp; section: ResumeChunk["section"] }> = [
  { regex: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)\b/i, section: "experience" },
  { regex: /^(PROJECTS|SELECTED PROJECTS|PERSONAL PROJECTS)\b/i, section: "projects" },
  { regex: /^(SKILLS|TECHNICAL SKILLS|CORE SKILLS)\b/i, section: "skills" },
  { regex: /^(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND)\b/i, section: "education" },
  { regex: /^(SUMMARY|PROFILE|ABOUT ME|CAREER SUMMARY)\b/i, section: "summary" },
];

function mapHeaderToSection(header: string): ResumeChunk["section"] {
  const normalized = header.trim().toUpperCase();
  const match = SECTION_PATTERNS.find((item) => item.regex.test(normalized));
  return match ? match.section : "other";
}

function splitParagraphIntoChunks(
  paragraph: string,
  section: ResumeChunk["section"]
): ResumeChunk[] {
  const sentenceMatches = paragraph.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [paragraph];
  const chunks: ResumeChunk[] = [];
  let buffer = "";

  for (const sentence of sentenceMatches) {
    const part = sentence.trim();
    const next = buffer ? `${buffer} ${part}` : part;

    if (next.length > 450 && buffer) {
      chunks.push({ id: nanoid(), section, content: buffer.trim() });
      buffer = part;
    } else {
      buffer = next;
    }
  }

  if (buffer.trim()) {
    chunks.push({ id: nanoid(), section, content: buffer.trim() });
  }

  return chunks;
}

function flushText(
  text: string,
  section: ResumeChunk["section"],
  chunks: ResumeChunk[]
) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const paragraphChunks = splitParagraphIntoChunks(paragraph, section);
    chunks.push(...paragraphChunks);
  }
}

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const pdfData = await pdf(buffer);
  return (pdfData.text ?? "").trim();
}

export function chunkResume(rawText: string): ResumeChunk[] {
  const normalizedText = rawText.replace(/\r/g, "").trim();
  if (!normalizedText) return [];

  const lines = normalizedText.split(/\n/);
  const chunks: ResumeChunk[] = [];
  let currentSection: ResumeChunk["section"] = "other";
  let currentText = "";

  for (const line of lines) {
    const headerMatch = SECTION_PATTERNS.find((item) => item.regex.test(line));

    if (headerMatch) {
      if (currentText.trim()) {
        flushText(currentText, currentSection, chunks);
        currentText = "";
      }
      currentSection = headerMatch.section;
      continue;
    }

    if (!line.trim()) {
      if (currentText.trim()) {
        flushText(currentText, currentSection, chunks);
        currentText = "";
      }
      continue;
    }

    currentText = currentText ? `${currentText}\n${line}` : line;
  }

  if (currentText.trim()) {
    flushText(currentText, currentSection, chunks);
  }

  return chunks.filter((chunk) => chunk.content.length > 20);
}
