import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchLiveJobListings } from '@/lib/job-listings';
import { rankJobListings } from '@/lib/job-ranking';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId } = body as { resumeId?: string };

    if (!resumeId || typeof resumeId !== 'string') {
      return NextResponse.json({ error: 'A valid resumeId is required.' }, { status: 400 });
    }

    const chunks = await sql`
      SELECT embedding
      FROM resume_chunks
      WHERE resume_id = ${resumeId}
    `;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json({ rankedJobs: [], message: 'No resume chunks were found for this resume.' }, { status: 404 });
    }

    const resumeChunkEmbeddings = chunks.map((chunk: any) => JSON.parse(chunk.embedding) as number[]);
    const jobListings = await fetchLiveJobListings(20);

    if (jobListings.length === 0) {
      return NextResponse.json({ rankedJobs: [], message: 'Live job listings are temporarily unavailable. Try again later.' });
    }

    const rankedJobs = (await rankJobListings(resumeChunkEmbeddings, jobListings)).slice(0, 10);

    return NextResponse.json({ rankedJobs });
  } catch (error) {
    console.error('Recommended jobs error:', error);
    return NextResponse.json({ rankedJobs: [], message: 'Unable to load recommended jobs right now.' }, { status: 500 });
  }
}
