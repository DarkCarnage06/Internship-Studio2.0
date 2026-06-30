# Architecture

## System Diagram

```mermaid
graph TD
    A[User] -->|Uploads PDF resume| B[/analyze - Next.js Page]
    B -->|POST| C[/api/upload-resume]
    C -->|parse + chunk| D[pdf-parse + heuristic chunker]
    D -->|chunks| E[Voyage AI - embed as 'document']
    E -->|1024-dim vectors| F[(Neon Postgres + pgvector)]
    
    A -->|Pastes job description| B
    B -->|POST| G[/api/match]
    G -->|embed JD as 'query'| E
    G -->|fetch chunk embeddings| F
    G -->|cosine similarity| H[rankChunks - pure function]
    H -->|top-5 chunks + score| I[Claude API]
    I -->|grounded analysis| J[fallback: template if API fails]
    G -->|matchScore + chunks + analysis| K[/results page]
    
    A -->|Clicks Load Jobs| K
    K -->|POST| L[/api/recommended-jobs]
    L -->|fetch live listings| M[Arbeitnow API]
    M -->|batch embed all listings| E
    L -->|fetch resume embeddings| F
    L -->|score + rank| N[scoreAndRankJobs - pure function]
    N -->|ranked jobs| K
```

## Data Flow

1. User uploads a PDF resume at /analyze. It's parsed server-side with pdf-parse and split into sections (experience, projects, education, skills) using header-detection heuristics.
2. Each chunk is embedded via Voyage AI's voyage-3.5-lite model with input_type 'document', producing 1024-dimensional vectors. These are stored in Postgres alongside the original text, using pgvector's vector(1024) column type with an HNSW index for fast approximate nearest-neighbor search.
3. When a job description is pasted, it's embedded with input_type 'query' — the asymmetric counterpart to the document embeddings. This pairing is intentional: Voyage's models are tuned to produce better retrieval quality when queries and documents are embedded in their respective modes, rather than treating both as generic text.
4. Cosine similarity is computed between the JD embedding and every stored resume chunk embedding. This logic lives in a pure function (rankChunks) with zero side effects, making it fully unit-testable.
5. The top-5 highest-scoring chunks are passed to Claude along with the job description. The prompt explicitly restricts the model to reasoning only about the provided chunks, and requests a structured JSON response (summary, strengths, gaps). If the Anthropic API is unavailable or the key is unset, a template-based fallback generates an equivalent structure from the raw similarity scores — no feature is API-dependent to the point of breaking.
6. For live job matching, listings are fetched from Arbeitnow's public API, normalized, and biased toward remote-tagged roles client-side (since the API has no server-side country filter and is Europe-focused). All listing descriptions are embedded in a single batched Voyage API call rather than one-by-one, then scored against the resume using the same cosine similarity approach, via another pure function (scoreAndRankJobs).

## Why This Stack

- **Next.js 14 App Router** — server-side PDF parsing and database access without a separate backend service; API routes co-located with the frontend.
- **Voyage AI over OpenAI embeddings** — generous free tier (200M tokens) and native support for asymmetric retrieval via input_type, which is a meaningfully better retrieval pattern than symmetric embedding.
- **pgvector over a dedicated vector database (Pinecone, etc.)** — the dataset size here doesn't require a specialized vector DB; Postgres with the HNSW index handles this scale easily, and it avoids managing a second database service.
- **Claude API with mandatory fallback** — LLM reasoning is the one place AI is used for actual generation (vs. the deterministic math in retrieval/ranking); the fallback ensures the product works in demos and CI without API credits.
- **Zustand over Redux/Context** — the client state here (resume data, match results) is simple enough that a minimal store is the right complexity level.

## What I'd Change for Scale (10k+ resumes/day)

- **Cache embeddings for repeated job descriptions** — if many users paste similar JDs (e.g. the same internship posting), re-embedding identical text wastes API calls. A content-hash cache would eliminate this.
- **Move live job listing embedding to a background job with caching** — currently every "Load Jobs" click re-fetches and re-embeds up to 20 listings from Arbeitnow. At scale, this should be a scheduled job that embeds new listings once and stores them, so user requests only need to query, not embed.
- **Add a proper India-coverage job source** — JSearch (RapidAPI) or a similar aggregator with India filtering, used alongside Arbeitnow rather than instead of it.
- **Rate limiting on /api/upload-resume and /api/match** — currently unprotected; a malicious user could spam PDF uploads or job description embeddings.
- **Switch pgvector's HNSW index parameters for higher recall** — default settings prioritize speed; at scale with many more chunks, tuning ef_construction and m would improve match quality at a small latency cost.
