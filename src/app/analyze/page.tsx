"use client";

import { useState, type ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/store";
import type { ParsedResume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function uploadResume(file: File): Promise<ParsedResume & { resumeId: string }> {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch("/api/upload-resume", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to upload resume.");
  }

  return response.json();
}

export default function AnalyzePage() {
  const router = useRouter();
  const {
    parsedResume,
    resumeId,
    jobDescription,
    setParsedResume,
    setResumeId,
    setJobDescription,
    setMatchResult,
  } = useResumeStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleKeyDownOpen: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF resume.");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const parsed = await uploadResume(file);
      setParsedResume(parsed);
      setResumeId(parsed.resumeId);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setUploadError(null);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF resume.");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const parsed = await uploadResume(file);
      setParsedResume(parsed);
      setResumeId(parsed.resumeId);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeId || !jobDescription.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze the match.");
      }

      setMatchResult(data.matchScore, data.retrievedChunks, data.analysis ?? null);
      router.push("/results");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-6">
        <Card className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-400">Step 1: Upload your resume</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Build the best fit story from your resume.</h1>
              <p className="max-w-2xl text-slate-300">Upload a PDF resume and let the system extract your work experience, projects, skills, and education into meaningful sections.</p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-[1.25fr_0.75fr] items-start">
              <div
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                onClick={openFilePicker}
                onKeyDown={handleKeyDownOpen}
                role="button"
                tabIndex={0}
              >
                <Card className="rounded-3xl border-dashed border-slate-700 bg-slate-900/40 p-6 cursor-pointer hover:border-sky-400/60">
                  <CardContent className="flex items-center gap-4">
                    <div className="rounded-full bg-slate-900/60 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V8a4 4 0 014-4h2a4 4 0 014 4v8m-6 0v4m0-4H7" />
                      </svg>
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-100">Upload your resume</p>
                      <p className="text-sm leading-6 text-slate-400">Drag and drop or click to select a PDF. We parse it and split the content into resume chunks.</p>
                      <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-300">
                        {isUploading ? 'Parsing resume...' : fileName ?? 'No file selected yet.'}
                      </div>
                      {uploadError ? <p className="text-sm text-rose-400 mt-2">{uploadError}</p> : null}
                    </div>

                    <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-base font-semibold text-white">Resume preview</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Once uploaded, resume sections are extracted for transparency and debugging.</p>

                <div className="mt-5 max-h-96 space-y-4 overflow-auto pr-2">
                  {parsedResume ? (
                    parsedResume.chunks.map((chunk) => (
                      <div key={chunk.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">{chunk.section}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{chunk.content.slice(0, 140)}{chunk.content.length > 140 ? '…' : ''}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-6 text-sm text-slate-500">Resume chunks will appear here after upload.</div>
                  )}
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-400">Step 2: Paste a job description</p>
              <h2 className="text-2xl font-semibold text-white">Capture the role you want.</h2>
              <p className="max-w-2xl text-slate-300">Paste the job description below to compare your resume content against the actual role requirements.</p>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <Label htmlFor="jobDescription" className="block mb-2 text-sm font-medium text-slate-200">Job description</Label>
                <Textarea id="jobDescription" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={10} placeholder="Paste the job posting or hiring brief here…" className="min-h-[10rem] p-4" />
              </div>

              {analysisError ? <p className="text-sm text-rose-400">{analysisError}</p> : null}

              <Button type="button" onClick={handleAnalyze} disabled={isUploading || isAnalyzing || !parsedResume || !jobDescription.trim()} className="w-full py-3">{isAnalyzing ? 'Analyzing...' : 'Analyze Match →'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
