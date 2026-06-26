export type ResumeChunk = {
  id: string;
  section: "experience" | "projects" | "skills" | "education" | "summary" | "other";
  content: string;
  embedding?: number[];
};

export type ParsedResume = {
  rawText: string;
  chunks: ResumeChunk[];
};

export type JobDescription = {
  rawText: string;
  title?: string;
  company?: string;
};
