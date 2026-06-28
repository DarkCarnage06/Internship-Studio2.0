import { generateEmbeddings } from './embeddings';
import { cosineSimilarity } from './similarity';
import { sql } from './db';

export type RetrievedChunk = {
  id: string;
  section: string;
  content: string;
  similarity: number;
};

type ChunkWithEmbedding = {
  id: string;
  section: string;
  content: string;
  embedding: number[];
};

export function rankChunks(
  chunks: ChunkWithEmbedding[],
  queryEmbedding: number[],
  topK: number = 5
): RetrievedChunk[] {
  const scored = chunks.map((chunk) => ({
    id: chunk.id,
    section: chunk.section,
    content: chunk.content,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

export async function retrieveTopChunks(
  resumeId: string,
  jobDescription: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  const [jdEmbedding] = await generateEmbeddings([jobDescription], 'query');

  const chunks = await sql`
    SELECT id, section, content, embedding
    FROM resume_chunks
    WHERE resume_id = ${resumeId}
  `;

  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const parsed = chunks.map((chunk: any) => ({
    id: chunk.id,
    section: chunk.section,
    content: chunk.content,
    embedding: JSON.parse(chunk.embedding) as number[],
  }));

  return rankChunks(parsed, jdEmbedding, topK);
}

export function calculateOverallMatchScore(retrievedChunks: RetrievedChunk[]): number {
  if (retrievedChunks.length === 0) return 0;

  const weights = retrievedChunks.map((_, i) => 1 / (i + 1));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const weightedSum = retrievedChunks.reduce((sum, chunk, i) => sum + chunk.similarity * weights[i], 0);

  return Math.round((weightedSum / weightSum) * 100);
}
