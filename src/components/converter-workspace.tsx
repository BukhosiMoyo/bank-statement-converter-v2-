"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  buildCsv,
  buildXlsx,
  resolveBatchZipFileName,
  resolveCsvFileName,
  resolveXlsxFileName,
} from "@/lib/csv";
import type { UserPlanSummary } from "@/lib/app-data";
import { takeHomeUploadHandoff } from "@/lib/home-upload";
import type { StatementPreview } from "@/lib/types";

type ConverterErrorState = {
  message: string;
  guidance: string[];
};

type BatchItemStatus = "queued" | "processing" | "success" | "failed";

type BatchItem = {
  id: string;
  file: File | null;
  fileName: string;
  status: BatchItemStatus;
  preview: StatementPreview | null;
  conversionId: string | null;
  projectId: string | null;
  error: ConverterErrorState | null;
};

type ConvertRouteSuccess = {
  preview: StatementPreview;
  conversionId?: string | null;
  projectId?: string | null;
};

type ConvertRouteFailure = {
  error: string;
  guidance?: string[];
};

function downloadCsv(
  preview: StatementPreview,
  preferredBaseName?: string | null,
) {
  const csv = buildCsv(preview);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = resolveCsvFileName(preview, preferredBaseName);
  anchor.click();
  URL.revokeObjectURL(url);
}

async function downloadXlsx(
  preview: StatementPreview,
  preferredBaseName?: string | null,
) {
  const workbook = await buildXlsx(preview);
  const blob = new Blob([workbook], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = resolveXlsxFileName(preview, preferredBaseName);
  anchor.click();
  URL.revokeObjectURL(url);
}

function resolveUniqueZipEntryName(
  fileName: string,
  usedFileNames: Set<string>,
) {
  if (!usedFileNames.has(fileName)) {
    usedFileNames.add(fileName);
    return fileName;
  }

  const extensionIndex = fileName.lastIndexOf(".");
  const hasExtension = extensionIndex > 0;
  const baseName = hasExtension ? fileName.slice(0, extensionIndex) : fileName;
  const extension = hasExtension ? fileName.slice(extensionIndex) : "";
  let suffix = 2;
  let candidate = `${baseName}-${suffix}${extension}`;

  while (usedFileNames.has(candidate)) {
    suffix += 1;
    candidate = `${baseName}-${suffix}${extension}`;
  }

  usedFileNames.add(candidate);
  return candidate;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/8 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function formatStatementsRemaining(remaining: number) {
  return `${remaining} ${remaining === 1 ? "statement" : "statements"} remaining`;
}

function formatUsageChip(summary: UserPlanSummary) {
  if (summary.usage.usingCredits) {
    return `${summary.planName}: ${summary.credits.creditsRemaining} credits remaining`;
  }

  return `${summary.planName}: ${formatStatementsRemaining(
    summary.usage.conversionsRemaining,
  )}`;
}

function getPreviewGuidance(preview: StatementPreview) {
  const lowConfidenceCount = preview.rows.filter(
    (row) => row.confidence === "low",
  ).length;
  const guidance: string[] = [];

  if (
    preview.layoutSupport === "best_effort" ||
    preview.parserId === "adaptive-generic"
  ) {
    guidance.push("This layout used best-effort parsing.");
  }

  if (lowConfidenceCount > 0) {
    guidance.push(`${lowConfidenceCount} rows need closer review before export.`);
  }

  if (!preview.detectedBank) {
    guidance.push("The bank could not be identified from this statement.");
  }

  return guidance;
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: StatementPreview["rows"][number]["confidence"];
}) {
  const classes = {
    high: "bg-[rgba(22,106,91,0.14)] text-[var(--accent)]",
    medium: "bg-[rgba(197,142,70,0.16)] text-[#8a5c1e]",
    low: "bg-[rgba(140,63,63,0.12)] text-[#8c3f3f]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[confidence]}`}
    >
      {confidence}
    </span>
  );
}

function createBatchItemId(fileName: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${fileName}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isPdfFile(file: File) {
  const mimeType = file.type || file.name.toLowerCase();

  return (
    mimeType.includes("pdf") ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function createInitialBatchItem(
  preview: StatementPreview,
  conversionId: string | null,
  projectId: string | null,
): BatchItem {
  return {
    id: createBatchItemId(preview.fileName),
    file: null,
    fileName: preview.fileName,
    status: "success",
    preview,
    conversionId,
    projectId,
    error: null,
  };
}

function createQueuedBatchItems(files: File[]) {
  return files.map((file) => {
    if (!isPdfFile(file)) {
      return {
        id: createBatchItemId(file.name),
        file: null,
        fileName: file.name,
        status: "failed" as const,
        preview: null,
        conversionId: null,
        projectId: null,
        error: {
          message: "Only PDF files are supported.",
          guidance: [],
        },
      } satisfies BatchItem;
    }

    return {
      id: createBatchItemId(file.name),
      file,
      fileName: file.name,
      status: "queued" as const,
      preview: null,
      conversionId: null,
      projectId: null,
      error: null,
    } satisfies BatchItem;
  });
}

function getItemStatusLabel(item: BatchItem) {
  if (item.status === "queued") {
    return "Queued";
  }

  if (item.status === "processing") {
    return "Processing";
  }

  if (item.status === "success") {
    return "Ready";
  }

  if (item.error?.message === "Only PDF files are supported.") {
    return "Unsupported format";
  }

  if (item.error?.message.toLowerCase().includes("scanned")) {
    return "Scanned PDF";
  }

  if (
    item.error?.message.toLowerCase().includes("limit") ||
    item.error?.guidance.some((entry) => entry.toLowerCase().includes("change plan"))
  ) {
    return "Limit exceeded";
  }

  if (item.error?.message.toLowerCase().includes("no transaction rows")) {
    return "Unsupported layout";
  }

  return "Failed";
}

function getItemStatusTone(item: BatchItem) {
  if (item.status === "success") {
    return "border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] text-[var(--accent)]";
  }

  if (item.status === "processing") {
    return "border-[rgba(197,142,70,0.18)] bg-[rgba(197,142,70,0.08)] text-[#8a5c1e]";
  }

  if (item.status === "failed") {
    return "border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] text-[#8c3f3f]";
  }

  return "border-black/8 bg-white/70 text-[var(--muted)]";
}

function getItemSummary(item: BatchItem) {
  if (item.status === "success" && item.preview) {
    const bank = item.preview.detectedBank ?? "Bank not detected";
    return `${item.preview.rowCount} rows · ${bank}`;
  }

  if (item.status === "processing") {
    return "Building preview...";
  }

  if (item.status === "failed" && item.error) {
    return item.error.message;
  }

  return "Ready to process";
}

function getFirstActiveItemId(items: BatchItem[]) {
  return items[0]?.id ?? null;
}

export function ConverterWorkspace({
  authenticatedConvertPath = "/convert",
  billingHref = "/pricing",
  canManageSavedConversion,
  defaultCurrency,
  defaultExportName,
  initialUploadHandoffId,
  initialPreview,
  initialConversionId,
  initialProjectId,
  isAuthenticated,
  usageSummary,
  workspaceLabel,
  workspaceType,
  projects,
}: {
  authenticatedConvertPath?: string;
  billingHref?: string;
  canManageSavedConversion: boolean;
  defaultCurrency: string;
  defaultExportName: string | null;
  initialUploadHandoffId: string | null;
  initialPreview: StatementPreview | null;
  initialConversionId: string | null;
  initialProjectId: string | null;
  isAuthenticated: boolean;
  usageSummary: UserPlanSummary | null;
  workspaceLabel: string;
  workspaceType: "personal" | "organization";
  projects: Array<{
    id: string;
    name: string;
  }>;
}) {
  const router = useRouter();
  const initialItems = initialPreview
    ? [createInitialBatchItem(initialPreview, initialConversionId, initialProjectId)]
    : [];
  const [batchItems, setBatchItems] = useState<BatchItem[]>(initialItems);
  const [activeItemId, setActiveItemId] = useState<string | null>(
    getFirstActiveItemId(initialItems),
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjectId ?? "",
  );
  const [error, setError] = useState<ConverterErrorState | null>(null);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isDeletingConversion, setIsDeletingConversion] = useState(false);
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const limitReached = usageSummary?.usage.limitReached ?? false;
  const activeItem =
    batchItems.find((item) => item.id === activeItemId) ?? batchItems[0] ?? null;
  const preview = activeItem?.preview ?? null;
  const currentConversionId = activeItem?.conversionId ?? null;
  const hasPreview = preview !== null;
  const previewGuidance = preview ? getPreviewGuidance(preview) : [];
  const queuedItems = batchItems.filter(
    (item) => item.status === "queued" && item.file,
  );
  const processingCount = batchItems.filter(
    (item) => item.status === "processing",
  ).length;
  const successfulItems = batchItems.filter(
    (item): item is BatchItem & { preview: StatementPreview } =>
      item.status === "success" && item.preview !== null,
  );
  const hasBatchSummary = batchItems.length > 0;
  const successCount = batchItems.filter((item) => item.status === "success").length;
  const failedCount = batchItems.filter((item) => item.status === "failed").length;
  const totalRows = batchItems.reduce(
    (sum, item) => sum + (item.preview?.rowCount ?? 0),
    0,
  );
  const canBuild = queuedItems.length > 0 && !isSubmitting && !limitReached;
  const canDownloadBatch = batchItems.length > 1 && successfulItems.length > 0;

  function replaceSelection(nextFiles: File[]) {
    const nextItems = createQueuedBatchItems(nextFiles);

    setBatchItems(nextItems);
    setActiveItemId(getFirstActiveItemId(nextItems));
    setProjectStatus(null);
    setError(null);
  }

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);

    replaceSelection(nextFiles);
    event.currentTarget.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files ?? []);

    if (droppedFiles.length === 0) {
      return;
    }

    replaceSelection(droppedFiles);
  }

  const processQueuedItems = useCallback(
    async (itemsToProcess: BatchItem[]) => {
      if (limitReached) {
        setError({
          message: usageSummary?.usage.limitMessage ?? "Plan limit reached.",
          guidance: ["Change plan or buy credits to keep processing statements this month."],
        });
        return;
      }

      if (itemsToProcess.length === 0) {
        setError({
          message: "Select a PDF.",
          guidance: [],
        });
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setProjectStatus(null);

      let stopDueToLimit: ConverterErrorState | null = null;
      let lastSuccessfulConversionId: string | null = null;

      for (const item of itemsToProcess) {
        setActiveItemId(item.id);

        if (stopDueToLimit) {
          setBatchItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    file: null,
                    status: "failed",
                    error: stopDueToLimit,
                  }
                : currentItem,
            ),
          );
          continue;
        }

        setBatchItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  status: "processing",
                  error: null,
                }
              : currentItem,
          ),
        );

        const formData = new FormData();
        formData.set("statement", item.file!);

        if (isAuthenticated) {
          formData.set("projectId", selectedProjectId);
        }

        try {
          const response = await fetch("/api/convert", {
            method: "POST",
            body: formData,
          });
          const payload = (await response.json()) as
            | ConvertRouteFailure
            | ConvertRouteSuccess;

          if (!response.ok || !("preview" in payload)) {
            const nextError = {
              message:
                "error" in payload
                  ? payload.error
                  : "The preview could not be created.",
              guidance:
                "error" in payload && Array.isArray(payload.guidance)
                  ? payload.guidance
                  : [],
            } satisfies ConverterErrorState;

            setBatchItems((currentItems) =>
              currentItems.map((currentItem) =>
                currentItem.id === item.id
                  ? {
                      ...currentItem,
                      file: null,
                      status: "failed",
                      error: nextError,
                    }
                  : currentItem,
              ),
            );

            if (response.status === 403) {
              stopDueToLimit = nextError;
            }

            continue;
          }

          lastSuccessfulConversionId = payload.conversionId ?? null;
          setBatchItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    file: null,
                    fileName: payload.preview.fileName,
                    status: "success",
                    preview: payload.preview,
                    conversionId: payload.conversionId ?? null,
                    projectId: payload.projectId ?? null,
                    error: null,
                  }
                : currentItem,
            ),
          );
        } catch {
          setBatchItems((currentItems) =>
            currentItems.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    file: null,
                    status: "failed",
                    error: {
                      message: "The preview could not be created.",
                      guidance: [],
                    },
                  }
                : currentItem,
            ),
          );
        }
      }

      setIsSubmitting(false);

      if (isAuthenticated) {
        router.refresh();
      }

      if (itemsToProcess.length === 1 && lastSuccessfulConversionId) {
        router.replace(
          `${authenticatedConvertPath}?conversion=${lastSuccessfulConversionId}`,
        );
      } else {
        router.replace(authenticatedConvertPath);
      }
    },
    [
      authenticatedConvertPath,
      isAuthenticated,
      limitReached,
      router,
      selectedProjectId,
      usageSummary?.usage.limitMessage,
    ],
  );

  useEffect(() => {
    if (
      !initialUploadHandoffId ||
      initialPreview ||
      initialConversionId ||
      batchItems.length > 0
    ) {
      return;
    }

    const pendingUpload = takeHomeUploadHandoff(initialUploadHandoffId);

    if (!pendingUpload) {
      router.replace(authenticatedConvertPath);
      return;
    }

    const nextItems = createQueuedBatchItems([pendingUpload.file]);

    setBatchItems(nextItems);
    setActiveItemId(getFirstActiveItemId(nextItems));
    setProjectStatus(null);
    setError(null);
    void processQueuedItems(
      nextItems.filter((item) => item.status === "queued" && item.file !== null),
    );
  }, [
    batchItems.length,
    initialConversionId,
    initialPreview,
    initialUploadHandoffId,
    processQueuedItems,
    router,
    authenticatedConvertPath,
  ]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await processQueuedItems(queuedItems);
  }

  async function handleProjectSave() {
    if (!currentConversionId || !activeItem) {
      return;
    }

    setIsSavingProject(true);
    setProjectStatus(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversions/${currentConversionId}/project`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectId: selectedProjectId || null,
          }),
        },
      );
      const payload = (await response.json()) as
        | { error: string }
        | {
            conversion: {
              id: string;
              projectId: string | null;
              preview: StatementPreview;
            };
          };

      if (!response.ok || !("conversion" in payload)) {
        setError({
          message:
            "error" in payload ? payload.error : "Project assignment could not be saved.",
          guidance: [],
        });
        return;
      }

      setBatchItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === activeItem.id
            ? {
                ...currentItem,
                preview: payload.conversion.preview,
                conversionId: payload.conversion.id,
                projectId: payload.conversion.projectId ?? null,
                error: null,
              }
            : currentItem,
        ),
      );
      setProjectStatus("Project saved.");
      router.refresh();
    } catch {
      setError({
        message: "Project assignment could not be saved.",
        guidance: [],
      });
    } finally {
      setIsSavingProject(false);
    }
  }

  async function handleDeleteConversion() {
    if (!currentConversionId || !activeItem) {
      return;
    }

    const confirmed = window.confirm("Delete this saved conversion?");

    if (!confirmed) {
      return;
    }

    setIsDeletingConversion(true);
    setProjectStatus(null);
    setError(null);

    try {
      const response = await fetch(`/api/conversions/${currentConversionId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError({
          message: payload.error ?? "Saved conversion could not be deleted.",
          guidance: [],
        });
        return;
      }

      const remainingItems = batchItems.filter((item) => item.id !== activeItem.id);

      setBatchItems(remainingItems);
      setActiveItemId(getFirstActiveItemId(remainingItems));
      setProjectStatus("Saved conversion deleted.");
      router.replace(authenticatedConvertPath);
      router.refresh();
    } catch {
      setError({
        message: "Saved conversion could not be deleted.",
        guidance: [],
      });
    } finally {
      setIsDeletingConversion(false);
    }
  }

  async function handleDownloadBatch() {
    if (!canDownloadBatch) {
      return;
    }

    setIsDownloadingBatch(true);
    setError(null);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const usedFileNames = new Set<string>();

      for (const item of successfulItems) {
        const csvName = resolveUniqueZipEntryName(
          resolveCsvFileName(item.preview, defaultExportName),
          usedFileNames,
        );
        const xlsxName = resolveUniqueZipEntryName(
          resolveXlsxFileName(item.preview, defaultExportName),
          usedFileNames,
        );

        zip.file(csvName, buildCsv(item.preview));
        zip.file(xlsxName, await buildXlsx(item.preview));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = resolveBatchZipFileName();
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError({
        message: "Batch download could not be created.",
        guidance: [],
      });
    } finally {
      setIsDownloadingBatch(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="eyebrow inline-flex rounded-full px-3 py-1.5">
              PDF to working file
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Upload. Preview. Export.
            </h1>
          </div>
          {usageSummary ? (
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
              {formatUsageChip(usageSummary)}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
              No card required to get started
            </div>
          )}
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-3 block text-sm font-medium text-[var(--foreground)]">
              Statement PDFs
            </span>
            <div
              className={`table-grid rounded-[1.75rem] border border-dashed p-4 sm:p-6 ${
                isDragging
                  ? "border-[var(--accent)] bg-[rgba(22,106,91,0.08)]"
                  : "border-black/12 bg-[var(--surface-strong)]"
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
                className="block w-full cursor-pointer rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-6 text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--accent)]"
                multiple
                onChange={handleFileSelection}
                type="file"
              />
            </div>
          </label>

          {isAuthenticated && projects.length > 0 ? (
            <label className="block">
              <span className="mb-3 block text-sm font-medium text-[var(--foreground)]">
                Project
              </span>
              <select
                className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setProjectStatus(null);
                  setError(null);
                }}
                value={selectedProjectId}
              >
                <option value="">Leave unassigned</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!canBuild}
              type="submit"
            >
              {isSubmitting
                ? batchItems.length > 1
                  ? "Processing batch..."
                  : "Building preview..."
                : limitReached
                  ? "Limit reached"
                  : batchItems.length > 1
                    ? "Build previews"
                    : "Build preview"}
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!hasPreview}
              onClick={() => preview && downloadCsv(preview, defaultExportName)}
              type="button"
            >
              Download CSV
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!hasPreview}
              onClick={() => preview && void downloadXlsx(preview, defaultExportName)}
              type="button"
            >
              Download Excel
            </button>
            {canDownloadBatch ? (
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isDownloadingBatch}
                onClick={() => void handleDownloadBatch()}
                type="button"
              >
                {isDownloadingBatch ? "Preparing ZIP..." : "Download All"}
              </button>
            ) : null}
            {isAuthenticated && currentConversionId && projects.length > 0 ? (
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isSavingProject}
                onClick={handleProjectSave}
                type="button"
              >
                {isSavingProject ? "Saving project..." : "Save project"}
              </button>
            ) : null}
            {isAuthenticated && currentConversionId && canManageSavedConversion ? (
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isDeletingConversion}
                onClick={handleDeleteConversion}
                type="button"
              >
                {isDeletingConversion ? "Deleting..." : "Delete saved"}
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              <p>{error.message}</p>
              {error.guidance.length > 0 ? (
                <div className="mt-2 space-y-1 text-sm">
                  {error.guidance.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {usageSummary?.usage.warningMessage ? (
            <p className="rounded-2xl border border-[rgba(197,142,70,0.18)] bg-[rgba(197,142,70,0.08)] px-4 py-3 text-sm text-[#8a5c1e]">
              {usageSummary.usage.warningMessage}
            </p>
          ) : null}
          {usageSummary?.usage.limitReached ? (
            <p className="rounded-2xl border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-3 text-sm text-[#8c3f3f]">
              {usageSummary.usage.limitMessage}{" "}
              <Link href={billingHref} className="text-[var(--foreground)] underline">
                Change plan
              </Link>
            </p>
          ) : null}
          {projectStatus ? (
            <p className="rounded-2xl border border-[rgba(22,106,91,0.18)] bg-[rgba(22,106,91,0.07)] px-4 py-3 text-sm text-[var(--accent)]">
              {projectStatus}
            </p>
          ) : null}
        </form>
      </section>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          hasBatchSummary ? "xl:grid-cols-4" : "xl:grid-cols-3"
        }`}
      >
        <div className="panel rounded-[2rem] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Current output
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Stat
              label="Rows"
              value={preview ? String(preview.rowCount) : "0"}
            />
            <Stat
              label="Pages"
              value={preview ? String(preview.pageCount) : "0"}
            />
            <Stat
              label="Currency"
              value={preview?.detectedCurrency ?? defaultCurrency}
            />
            <Stat
              label="Window"
              value={
                preview?.statementStartDate && preview.statementEndDate
                  ? `${preview.statementStartDate} → ${preview.statementEndDate}`
                  : "Not detected"
              }
            />
          </div>
        </div>

        {hasBatchSummary ? (
          <div className="panel rounded-[2rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Batch
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Stat label="Files" value={String(batchItems.length)} />
              <Stat label="Success" value={String(successCount)} />
              <Stat label="Failed" value={String(failedCount)} />
              <Stat label="Rows" value={String(totalRows)} />
            </div>
            {isSubmitting || processingCount > 0 ? (
              <p className="mt-4 rounded-[1.4rem] border border-[rgba(197,142,70,0.18)] bg-[rgba(197,142,70,0.08)] px-4 py-3 text-sm text-[#8a5c1e]">
                Processing {successCount + failedCount + processingCount} of{" "}
                {batchItems.length}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="panel rounded-[2rem] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {usageSummary ? "Usage" : isAuthenticated ? "Workspace" : "Account flow"}
          </p>
          <div className="mt-5 space-y-3">
            {usageSummary ? (
              <>
                <div className="flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Workspace</span>
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    {workspaceType === "organization" ? "Organization" : "Personal"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Plan</span>
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    {usageSummary.planName}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Statements</span>
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    {usageSummary.usage.conversionsUsed} / {usageSummary.usage.conversionLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Credits</span>
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    {usageSummary.credits.creditsRemaining} credits
                  </span>
                </div>
                <Link
                  href={billingHref}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--line)] bg-white/70 px-6 text-sm font-medium text-[var(--foreground)]"
                >
                  Change plan
                </Link>
                <div className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                  {workspaceLabel}
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Workspace</span>
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    {workspaceType === "organization" ? "Organization" : "Personal"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Access</span>
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    Unlimited
                  </span>
                </div>
                <div className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                  {workspaceLabel}
                </div>
              </>
            ) : (
              <div className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                Create an account to save statements and manage client work.
              </div>
            )}
          </div>
        </div>

        <div className="panel rounded-[2rem] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Supported input
          </p>
          <div className="mt-5 space-y-3">
            {[
              "Digital, text-based PDFs work best.",
              "Strongest layouts: FNB, Standard Bank, Capitec.",
              "Scanned and image-only PDFs are not fully supported yet.",
              "Original PDFs are not stored after conversion.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-black/8 bg-white/70 px-4 py-3 text-sm text-[var(--foreground)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="panel rounded-[2rem] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Preview
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {activeItem?.fileName ?? "No file loaded"}
            </p>
          </div>
          {activeItem ? (
            <div className="rounded-full border border-black/8 bg-white/70 px-3 py-1.5 font-mono text-xs text-[var(--muted)]">
              {getItemStatusLabel(activeItem)}
            </div>
          ) : null}
        </div>

        {batchItems.length > 0 ? (
          <div className="border-b border-black/8 px-5 py-4 sm:px-6">
            <div className="grid gap-3 lg:grid-cols-2">
              {batchItems.map((item) => (
                <button
                  key={item.id}
                  className={`rounded-[1.5rem] border px-4 py-3 text-left ${
                    item.id === activeItemId
                      ? "border-[var(--accent)] bg-[rgba(22,106,91,0.08)]"
                      : "border-black/8 bg-white/70"
                  }`}
                  onClick={() => setActiveItemId(item.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {item.fileName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {getItemSummary(item)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getItemStatusTone(item)}`}
                    >
                      {getItemStatusLabel(item)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeItem?.status === "success" && preview ? (
          <>
            {preview.reviewRecommended || previewGuidance.length > 0 ? (
              <div className="border-b border-black/8 px-5 py-4 sm:px-6">
                <div className="rounded-[1.5rem] border border-[rgba(197,142,70,0.18)] bg-[rgba(197,142,70,0.08)] px-4 py-3 text-sm text-[#8a5c1e]">
                  <p>Manual review recommended before export.</p>
                  {previewGuidance.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {previewGuidance.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="bg-[rgba(255,255,255,0.64)] text-[var(--muted)]">
                    {[
                      "Date",
                      "Description",
                      "Debit",
                      "Credit",
                      "Balance",
                      "Page",
                      "Confidence",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="border-b border-black/8 px-4 py-3 font-medium"
                        scope="col"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.id} className="bg-white/62 align-top">
                      <td className="border-b border-black/6 px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.transactionDate}
                      </td>
                      <td className="border-b border-black/6 px-4 py-3 text-[var(--foreground)]">
                        <div className="max-w-xl space-y-1">
                          <p>{row.description}</p>
                          {row.reference ? (
                            <p className="font-mono text-xs text-[var(--muted)]">
                              {row.reference}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="border-b border-black/6 px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.debit ?? "—"}
                      </td>
                      <td className="border-b border-black/6 px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.credit ?? "—"}
                      </td>
                      <td className="border-b border-black/6 px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.balance ?? "—"}
                      </td>
                      <td className="border-b border-black/6 px-4 py-3 font-mono text-xs text-[var(--muted)]">
                        {row.sourcePage}
                      </td>
                      <td className="border-b border-black/6 px-4 py-3">
                        <ConfidenceBadge confidence={row.confidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeItem?.status === "failed" && activeItem.error ? (
          <div className="px-5 py-6 sm:px-6">
            <div className="rounded-[1.5rem] border border-[rgba(140,63,63,0.18)] bg-[rgba(140,63,63,0.06)] px-4 py-4 text-sm text-[#8c3f3f]">
              <p>{activeItem.error.message}</p>
              {activeItem.error.guidance.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {activeItem.error.guidance.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : activeItem?.status === "processing" ? (
          <div className="px-5 py-16 text-center sm:px-6">
            <p className="text-lg font-medium text-[var(--foreground)]">
              Preview in progress
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {activeItem.fileName}
            </p>
          </div>
        ) : activeItem?.status === "queued" ? (
          <div className="px-5 py-16 text-center sm:px-6">
            <p className="text-lg font-medium text-[var(--foreground)]">
              Ready to process
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {activeItem.fileName}
            </p>
          </div>
        ) : (
          <div className="px-5 py-16 text-center sm:px-6">
            <p className="text-lg font-medium text-[var(--foreground)]">
              Preview not ready
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Upload a PDF to inspect rows before export.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
