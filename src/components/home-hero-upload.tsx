"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createHomeUploadHandoff } from "@/lib/home-upload";

type UploadErrorState = {
  message: string;
  guidance: string[];
};

function isPdfFile(file: File) {
  const mimeType = file.type || file.name.toLowerCase();

  return mimeType.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
}

export function HomeHeroUpload() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<UploadErrorState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function setNextFile(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isPdfFile(file)) {
      setSelectedFile(null);
      setError({
        message: "Only PDF files are supported.",
        guidance: [],
      });
      return;
    }

    setSelectedFile(file);
    setError(null);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNextFile(event.target.files?.[0] ?? null);
    event.currentTarget.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    setNextFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError({
        message: "Select a PDF.",
        guidance: [],
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const handoffId = createHomeUploadHandoff(selectedFile);

      router.push(`/convert?handoff=${encodeURIComponent(handoffId)}`);
    } catch {
      setError({
        message: "The converter could not be opened.",
        guidance: [],
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel rounded-[2.2rem] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Upload statement
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Start here
          </p>
        </div>
        <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]">
          PDF upload
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div
          className={`rounded-[1.75rem] border border-dashed p-4 sm:p-6 ${
            isDragging
              ? "border-[var(--accent)] bg-[rgba(22,106,91,0.12)]"
              : "border-[var(--accent)] bg-[rgba(22,106,91,0.08)]"
          }`}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={handleDrop}
        >
          <input
            accept="application/pdf"
            className="block w-full cursor-pointer rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-6 text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--accent)]"
            onChange={handleFileChange}
            type="file"
          />
          {selectedFile ? (
            <div className="mt-4 rounded-[1.4rem] border border-black/8 bg-white/80 px-4 py-3">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {selectedFile.name}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Opening converter..." : "Start converting"}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
            <p>{error.message}</p>
            {error.guidance.length > 0 ? (
              <div className="mt-2 space-y-1">
                {error.guidance.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
