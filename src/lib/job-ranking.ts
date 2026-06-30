import { generateEmbeddings } from './embeddings';
import { cosineSimilarity } from './similarity';
import type { JobListing } from './job-listings';

export type RankedJobListing = JobListing & {
  matchScore: number;
};

export function scoreAndRankJobs(
  jobListings: JobListing[],
  jobEmbeddings: number[][],
  resumeChunkEmbeddings: number[][]
): RankedJobListing[] {
  if (jobListings.length === 0 || resumeChunkEmbeddings.length === 0) return [];

  const ranked = jobListings.map((job, i) => {
    const jobEmbedding = jobEmbeddings[i];
    const similarities = resumeChunkEmbeddings.map((chunkEmb) => cosineSimilarity(jobEmbedding, chunkEmb));
    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;

    return {
      ...job,
      matchScore: Math.round(avgSimilarity * 100),
    };
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore);
  return ranked;
}

export async function rankJobListings(
  resumeChunkEmbeddings: number[][],
  jobListings: JobListing[]
): Promise<RankedJobListing[]> {
  if (jobListings.length === 0) return [];

  const jobTexts = jobListings.map((j) => `${j.title} at ${j.companyName}. ${j.description}`);
  const jobEmbeddings = await generateEmbeddings(jobTexts, 'document');

  return scoreAndRankJobs(jobListings, jobEmbeddings, resumeChunkEmbeddings);
}
