import Anthropic from '@anthropic-ai/sdk';
import type { RetrievedChunk } from './retrieval';

export type MatchAnalysis = {
  summary: string;
  strengths: string[];
  gaps: string[];
  isAiGenerated: boolean;
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateMatchAnalysis(
  jobDescription: string,
  retrievedChunks: RetrievedChunk[],
  matchScore: number
): Promise<MatchAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy') {
    return generateFallbackAnalysis(retrievedChunks, matchScore);
  }

  try {
    const chunksText = retrievedChunks
      .map((c, i) => `[Chunk ${i + 1} - ${c.section}, ${Math.round(c.similarity * 100)}% similarity]\n${c.content}`)
      .join('\n\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a resume-to-job fit analyst. You must ONLY use information from the resume chunks provided below. Do not invent, assume, or infer any experience, skill, or qualification that is not explicitly stated in these chunks.

JOB DESCRIPTION:
${jobDescription}

RETRIEVED RESUME CHUNKS (ranked by relevance, ${matchScore}% overall match score):
${chunksText}

Respond in this EXACT JSON format with no other text before or after:
{
  "summary": "A 2-3 sentence grounded summary of how well this candidate fits, referencing specific evidence from the chunks above",
  "strengths": ["specific strength 1 tied to a chunk", "specific strength 2 tied to a chunk", "specific strength 3 tied to a chunk"],
  "gaps": ["specific gap or thing the JD asks for that isn't evidenced in the chunks", "another gap if applicable"]
}

If a gap genuinely cannot be identified from the JD vs the chunks, return an empty gaps array rather than inventing one. Every strength must reference something specific from the chunks, not generic resume advice.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const parsed = JSON.parse(responseText);

    return {
      summary: parsed.summary,
      strengths: parsed.strengths || [],
      gaps: parsed.gaps || [],
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('Anthropic API error, using fallback:', error);
    return generateFallbackAnalysis(retrievedChunks, matchScore);
  }
}

export function generateFallbackAnalysis(retrievedChunks: RetrievedChunk[], matchScore: number): MatchAnalysis {
  const topChunk = retrievedChunks[0];
  const tierLabel = matchScore >= 75 ? 'strong' : matchScore >= 50 ? 'moderate' : 'limited';

  return {
    summary: `This resume shows ${tierLabel} alignment with the job description, with a ${matchScore}% overall match score. The most relevant section is from ${topChunk?.section || 'the resume'}, which scored ${Math.round((topChunk?.similarity || 0) * 100)}% similarity to the role requirements.`,
    strengths: retrievedChunks.slice(0, 3).map((c) => {
      const sectionLabel = c.section.charAt(0).toUpperCase() + c.section.slice(1);
      return `${sectionLabel}: ${c.content.slice(0, 100)}...`;
    }),
    gaps: [],
    isAiGenerated: false,
  };
}
