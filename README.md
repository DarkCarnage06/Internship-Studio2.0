# Internship Studio 2.0

A resume-to-job matcher that uses real semantic search instead of keyword matching. Upload a resume, paste a job description (or get live job listings auto-matched), and get a grounded AI-generated explanation of fit — not just a percentage.

This is v2 of a TF-IDF based matcher I built earlier. This version replaces keyword overlap with actual embeddings, vector search, and LLM reasoning grounded in retrieved evidence.

## Live Demo
[ADD YOUR VERCEL URL HERE]

## What it does

1. Upload a PDF resume — it's parsed and split into semantic chunks (experience, projects, education, skills)
2. Each chunk is embedded using Voyage AI and stored in Postgres with pgvector
3. Paste a job description (or load live job listings) — it's embedded and compared against every resume chunk using cosine similarity
4. Top-5 most relevant chunks are retrieved and passed to Claude, which generates a grounded explanation: a summary, specific strengths, and specific gaps — never inventing experience not in the resume
5. Live job listings from Arbeitnow are fetched, embedded in a single batched call, and ranked against the resume the same way

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Voyage AI (voyage-3.5-lite) for embeddings — asymmetric retrieval (document vs query mode)
- Neon Postgres + pgvector with HNSW index for vector similarity search
- Claude API (Anthropic) for grounded reasoning, with a fully functional template fallback
- Zustand for client state
- Arbeitnow public API for live job listings

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add DATABASE_URL, VOYAGE_API_KEY, ANTHROPIC_API_KEY (or "dummy" for fallback mode)
npm run db:migrate
npm run dev
npm test
```

## Architecture

See ARCHITECTURE.md for the full system diagram and data flow.

## Decisions

1. **Pure functions for testable logic** — cosineSimilarity, rankChunks, and scoreAndRankJobs are all extracted as pure functions with zero database or API dependencies, so the core math is fully unit-tested without mocking external services.

2. **Asymmetric retrieval over symmetric** — resume chunks are embedded with input_type 'document', job descriptions and live listings with input_type 'query'. This is a real production RAG technique that measurably improves retrieval quality over using the same embedding mode for both.

3. **Grounded LLM reasoning with explicit anti-hallucination instructions** — the Claude prompt explicitly limits reasoning to only the top-5 retrieved chunks and instructs the model not to invent experience not present in the evidence. A finance-person-readable analogy from a previous project: a recruiter should be able to verify every claim against the actual resume text.

4. **Graceful degradation everywhere** — the LLM reasoning layer has a full template-based fallback, and the live job listings feature returns a friendly message instead of crashing if Arbeitnow's API is down. The product should never hard-fail just because one external dependency is unavailable.

5. **Honest scope disclosure over silent underdelivery** — Arbeitnow is Europe-focused with no India-specific filtering available for free. Rather than pretending the live job matching covers India well, the UI explicitly discloses this limitation and biases toward remote-tagged listings, which are realistically what most candidates can apply to regardless of location.

## v1 vs v2

v1 (linked below) used TF-IDF and cosine similarity over raw keyword vectors — it could only catch literal word overlap between a resume and a job description. v2 uses real semantic embeddings, meaning it correctly identifies relevant experience even when the wording is completely different (e.g. matching "built CNN models for image classification" against a JD asking for "computer vision experience" with zero shared keywords).

v1 repo: [ADD LINK IF YOU WANT TO REFERENCE IT]
