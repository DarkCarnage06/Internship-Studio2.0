"use client";

import { useState, type ChangeEvent } from "react";
import { useResumeStore } from "@/lib/store";
import type { ParsedResume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function uploadResume(file: File): Promise<ParsedResume> {
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
  const { parsedResume, jobDescription, setParsedResume, setJobDescription } = useResumeStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
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
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = () => {
    console.log("Resume chunks:", parsedResume?.chunks);
    console.log("Job description:", jobDescription);
    alert("Coming in Day 2: semantic match analysis with embeddings and reasoning.");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Card>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
                Step 1: Upload your resume
              </p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Build the best fit story from your resume.
              </h1>
              <p className="max-w-2xl text-slate-300">
                Upload a PDF resume and let the system extract your work experience,
                projects, skills, and education into meaningful sections.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-[1.25fr_0.75fr]">
              <label
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                className="block cursor-pointer rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-8 text-center transition hover:border-sky-400/60"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-100">Upload your resume</p>
                  <p className="text-sm leading-6 text-slate-400">
                    Drag and drop or click to select a PDF. We parse it and split the content into resume chunks.
                  </p>
                  <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-300">
                    {isUploading ? "Parsing resume..." : fileName ?? "No file selected yet."}
                  </div>
                  {uploadError ? <p className="text-sm text-rose-400">{uploadError}</p> : null}
                </div>
              </label>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                <h2 className="text-base font-semibold text-white">Resume preview</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Once uploaded, resume sections are extracted for transparency and debugging.
                </p>

                <div className="mt-5 max-h-96 space-y-4 overflow-auto pr-2">
                  {parsedResume ? (
                    parsedResume.chunks.map((chunk) => (
                      <div key={chunk.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                          {chunk.section}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          {chunk.content.slice(0, 100)}
                          {chunk.content.length > 100 ? "…" : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-6 text-sm text-slate-500">
                      Resume chunks will appear here after upload.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
                Step 2: Paste a job description
              </p>
              <h2 className="text-2xl font-semibold text-white">Capture the role you want.</h2>
              <p className="max-w-2xl text-slate-300">
                Paste the job description below to compare your resume content against the actual role requirements.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <Label htmlFor="jobDescription">Job description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  rows={10}
                  placeholder="Paste the job posting or hiring brief here…"
                />
              </div>

              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={!parsedResume || !jobDescription.trim()}
              >
                Analyze Match →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
