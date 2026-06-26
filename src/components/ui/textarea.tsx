import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-4 text-sm text-slate-100 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20",
        className
      )}
      {...props}
    />
  );
}
