import { type ParsedResume } from "@/lib/types";
import { type RetrievedChunk } from "@/lib/retrieval";
import { type MatchAnalysis } from "@/lib/reasoning";
import { create } from "zustand";

interface ResumeStore {
  parsedResume: ParsedResume | null;
  resumeId: string | null;
  jobDescription: string;
  matchScore: number | null;
  retrievedChunks: RetrievedChunk[];
  analysis: MatchAnalysis | null;
  setParsedResume: (parsedResume: ParsedResume | null) => void;
  setResumeId: (resumeId: string | null) => void;
  setJobDescription: (jobDescription: string) => void;
  setMatchResult: (matchScore: number | null, retrievedChunks: RetrievedChunk[], analysis: MatchAnalysis | null) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  parsedResume: null,
  resumeId: null,
  jobDescription: "",
  matchScore: null,
  retrievedChunks: [],
  analysis: null,
  setParsedResume: (parsedResume) => set({ parsedResume }),
  setResumeId: (resumeId) => set({ resumeId }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setMatchResult: (matchScore, retrievedChunks, analysis) => set({ matchScore, retrievedChunks, analysis }),
}));
