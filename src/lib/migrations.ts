import { sql } from './db';

export async function runMigrations() {
  try {
    // Enable pgvector extension
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // Create resumes table
    await sql`
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        raw_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create resume_chunks table
    await sql`
      CREATE TABLE IF NOT EXISTS resume_chunks (
        id TEXT PRIMARY KEY,
        resume_id TEXT REFERENCES resumes(id),
        section TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1024),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index for vector search
    await sql`
      CREATE INDEX IF NOT EXISTS resume_chunks_embedding_idx 
      ON resume_chunks USING hnsw (embedding vector_cosine_ops)
    `;

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
