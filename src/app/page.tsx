import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-8">
      <div className="absolute inset-x-0 top-0 h-72 bg-slate-800/80 blur-3xl" />
      <div className="relative z-10 rounded-3xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">
              Resume Intelligence, modernized
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Stop Guessing If You&apos;re a Good Fit
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Upload your resume, paste a job description, and receive
              real semantic fit confidence backed by embeddings and LLM
              analysis — not old keyword matching.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/analyze" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Analyze My Fit →</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
