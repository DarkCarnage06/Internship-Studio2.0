"use client";

import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ResultsPage() {
  const router = useRouter();
  const { matchScore, retrievedChunks, analysis } = useResumeStore();

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-8">
        <Card className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-400">Results</p>
              <p className="max-w-2xl mx-auto text-slate-300">These are the resume sections most aligned with your job description.</p>
            </div>

            <div className="rounded-2xl p-10 bg-gradient-to-r from-slate-900/60 via-sky-900/30 to-emerald-900/20">
              <h2 className="text-6xl font-extrabold text-white">
                {matchScore !== null ? (
                  <span>
                    <span className="text-emerald-400">{matchScore}%</span> Match
                  </span>
                ) : (
                  'No score available'
                )}
              </h2>
              <p className="mt-3 text-lg text-slate-300">
                {matchScore === null
                  ? 'No score available'
                  : matchScore >= 75
                  ? 'Strong alignment with this role'
                  : matchScore >= 50
                  ? 'Moderate alignment — some relevant experience'
                  : 'Limited alignment with this specific role'}
              </p>
            </div>

            <div className="flex justify-center">
              <Button type="button" onClick={() => router.push('/analyze')} className="py-3 px-6">Try another job description</Button>
            </div>
          </CardContent>
        </Card>

        {analysis ? (
          <Card className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-white">Why this match</h3>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
                  {analysis.isAiGenerated ? 'AI Generated' : 'Template Summary'}
                </span>
              </div>

              <p className="text-sm leading-7 text-slate-300">{analysis.summary}</p>

              {analysis.strengths.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">Strengths</p>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength) => (
                      <li key={strength} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 text-emerald-400">●</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {analysis.gaps.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-400">Gaps</p>
                  <ul className="space-y-2">
                    {analysis.gaps.map((gap) => (
                      <li key={gap} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 text-amber-400">●</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          {retrievedChunks.length > 0 ? (
            retrievedChunks.map((chunk) => {
              const pct = chunk.similarity * 100;
              const badgeClass = pct > 60 ? 'bg-emerald-500 text-white' : pct >= 40 ? 'bg-yellow-400 text-black' : 'bg-slate-600 text-white';

              return (
                <Card key={chunk.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <CardContent className="space-y-3 p-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-400">{chunk.section}</p>
                      <div className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}>{pct.toFixed(1)}%</div>
                    </div>
                    <p className="text-sm leading-6 text-slate-200">{chunk.content}</p>
                  </CardContent>
                </Card>
              );
            })
            ) : (
            <Card className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <CardContent>
                <p className="text-sm text-slate-400">No matching chunks were found yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
