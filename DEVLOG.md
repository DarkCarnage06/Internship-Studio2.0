## Day 1 — 2026-06-26

**Hours worked:** 3

**What I did:** Set up Next.js project with TypeScript, Tailwind, shadcn/ui. Built PDF resume parsing using pdf-parse, with heuristic-based chunking that splits resume text into sections (experience, projects, skills, education). Built the upload UI with a live preview of extracted chunks for debugging. Fixed a Next.js font loading error and a Tailwind/shadcn CSS variable configuration issue.

**What I learned:** Section-based chunking using header detection works well for resumes since they follow fairly predictable structure. Tailwind v4's CSS variable approach for shadcn theming is different from v3 and needs explicit theme token mapping.

**Blockers / what I'm stuck on:** Chunking is heuristic-based right now — will need to test it against resumes with unusual formatting to see how robust it is.

**Plan for tomorrow:** Set up pgvector on Neon Postgres, generate embeddings for resume chunks, and build the core similarity search function.
