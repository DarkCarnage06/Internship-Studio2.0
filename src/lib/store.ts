import { type ParsedResume } from "@/lib/types";
import { create } from "zustand";

interface ResumeStore {
  parsedResume: ParsedResume | null;
  jobDescription: string;
  setParsedResume: (parsedResume: ParsedResume | null) => void;
  setJobDescription: (jobDescription: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  parsedResume: null,
  jobDescription: "",
  setParsedResume: (parsedResume) => set({ parsedResume }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
}));
