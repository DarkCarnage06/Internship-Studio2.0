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
## Day 3 — 2026-06-28

**Hours worked:** 4

**What I did:** Built the job description retrieval pipeline — embedding job descriptions with Voyage's 'query' input type, fetching stored resume chunk embeddings, computing cosine similarity against each, and ranking top-5 matches. Built a weighted overall match score (top matches count more than lower-ranked ones). Wrote 5 unit tests for the ranking and scoring logic using mocked data, extracted a pure rankChunks function so tests don't hit the real database or Voyage API. Wired up the full flow end-to-end: upload resume → paste job description → see ranked matches with similarity percentages. Fixed dark theme consistency issues across /analyze and /results pages — white backgrounds were leaking through on Card components that weren't explicitly styled.

**What I learned:** Asymmetric retrieval (query vs document embeddings) produces genuinely better ranking — tested it against my own resume and a real ML job description, and the system correctly ranked my CNN/YOLO/scikit-learn experience above less directly relevant ISRO work, purely from semantic understanding with zero keyword overlap. Also learned that shadcn Card components inherit light-mode styling by default unless explicitly overridden — dark theme isn't automatic just because the page wrapper is dark.

**Blockers / what I'm stuck on:** The match score is currently just a weighted average of similarity scores — it's a reasonable heuristic but I haven't validated it against human judgment yet. Need to sanity check whether 66% actually "feels" like a strong match to a real person.

**Plan for tomorrow:** Build the LLM reasoning layer — pass the top-5 retrieved chunks to Claude, generate a grounded explanation of the match (not just a number), and implement graceful fallback if the API fails.
Append this exact content to DEVLOG.md at the root. Do not overwrite anything:

## Day 4 — [TODAYS_DATE]

**Hours worked:** 3

**What I did:** Built the LLM reasoning layer using Claude API to generate grounded match explanations. Designed the prompt to strictly limit Claude to only reasoning about the retrieved chunks provided — explicit instructions against inventing or assuming experience not present in the evidence. Structured the output as JSON with summary, strengths, and gaps fields. Built a complete template-based fallback that works without any API key, tested it end-to-end since I don't have an Anthropic key yet. Fixed a string interpolation bug in the fallback where section names duplicated ("experience experience"). Added 5 unit tests for the fallback logic.

**What I learned:** Grounding an LLM prompt isn't just "be accurate" — it requires structurally limiting what data the model has access to (only top-k chunks, not the full resume) AND explicitly instructing it not to fill gaps with assumptions. The fallback path is just as important as the AI path — a real product can't break just because an API key is missing or a request times out.

**Blockers / what I'm stuck on:** Haven't tested the real Claude-generated path yet since I don't have API credits — only verified the fallback. Will need to test this before considering the feature fully complete.

**Plan for tomorrow:** Integrate live internship listings from a free job API, auto-rank them against the user's resume using the same retrieval pipeline, and build a final results UI showing ranked internship matches.