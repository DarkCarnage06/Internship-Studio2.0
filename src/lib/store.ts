import { type ParsedResume } from "@/lib/types";
import { type RetrievedChunk } from "@/lib/retrieval";
import { create } from "zustand";

interface ResumeStore {
  parsedResume: ParsedResume | null;
  resumeId: string | null;
  jobDescription: string;
  matchScore: number | null;
  retrievedChunks: RetrievedChunk[];
  setParsedResume: (parsedResume: ParsedResume | null) => void;
  setResumeId: (resumeId: string | null) => void;
  setJobDescription: (jobDescription: string) => void;
  setMatchResult: (matchScore: number | null, retrievedChunks: RetrievedChunk[]) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  parsedResume: null,
  resumeId: null,
  jobDescription: "",
  matchScore: null,
  retrievedChunks: [],
  setParsedResume: (parsedResume) => set({ parsedResume }),
  setResumeId: (resumeId) => set({ resumeId }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setMatchResult: (matchScore, retrievedChunks) => set({ matchScore, retrievedChunks }),
}));
