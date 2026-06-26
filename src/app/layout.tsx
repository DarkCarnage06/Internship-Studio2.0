import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internship Studio 2.0",
  description:
    "Semantic resume-to-job-description matching with embeddings, pgvector, and LLM reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-slate-100">
        {children}
      </body>
    </html>
  );
}
