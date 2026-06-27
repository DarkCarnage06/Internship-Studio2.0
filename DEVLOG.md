## Day 1 — 2026-06-26

**Hours worked:** 3

**What I did:** Set up Next.js project with TypeScript, Tailwind, shadcn/ui. Built PDF resume parsing using pdf-parse, with heuristic-based chunking that splits resume text into sections (experience, projects, skills, education). Built the upload UI with a live preview of extracted chunks for debugging. Fixed a Next.js font loading error and a Tailwind/shadcn CSS variable configuration issue.

**What I learned:** Section-based chunking using header detection works well for resumes since they follow fairly predictable structure. Tailwind v4's CSS variable approach for shadcn theming is different from v3 and needs explicit theme token mapping.

**Blockers / what I'm stuck on:** Chunking is heuristic-based right now — will need to test it against resumes with unusual formatting to see how robust it is.

**Plan for tomorrow:** Set up pgvector on Neon Postgres, generate embeddings for resume chunks, and build the core similarity search function.


## Day 2 — [2026-06-27]

**Hours worked:** 4

**What I did:** Set up pgvector extension on Neon Postgres. Built the database schema for resumes and resume_chunks tables with vector(1024) embedding columns and an HNSW index for fast cosine similarity search. Integrated Voyage AI's embedding API (voyage-3.5-lite, 1024 dimensions) using asymmetric retrieval — input_type 'document' for resume chunks, reserved 'query' type for job descriptions tomorrow. Wrote a pure cosineSimilarity function with 5 unit tests covering identical vectors, orthogonal vectors, opposite vectors, mismatched lengths, and zero vectors. Updated the upload-resume API route to generate embeddings and persist everything to the database.

**What I learned:** Asymmetric retrieval (different embedding modes for documents vs queries) is a real technique used in production RAG systems, not just a theoretical nicety — Voyage's API explicitly supports it via input_type. Also learned that Node.js ES module imports get hoisted above runtime code, which broke my dotenv loading until I switched to a dynamic import pattern in the migration script.

**Blockers / what I'm stuck on:** Need to verify retrieval quality with an actual job description tomorrow — right now I've only confirmed embeddings are being generated and stored correctly, not that the similarity search returns genuinely relevant matches.

**Plan for tomorrow:** Build job description embedding + retrieval pipeline. Embed a JD with input_type 'query', run cosine similarity against all resume chunks, return top-k matches, and verify the matches actually make semantic sense.