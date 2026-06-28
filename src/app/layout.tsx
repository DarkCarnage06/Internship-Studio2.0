import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className={cn("font-sans", inter.className)}>
      <body className="min-h-screen bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}
