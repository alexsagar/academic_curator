"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

interface TemplateCategory {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
}

interface TemplateRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  isActive: boolean;
  isPremium: boolean;
  portfolios: Array<{ id: string }>;
  categories: TemplateCategory[];
  creator: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface TemplateSubmissionRecord {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  adminReviewNotes: string | null;
  createdAt: string;
  submittedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  categories: TemplateCategory[];
}

const statusStyles: Record<string, string> = {
  SUBMITTED: "bg-primary/10 text-primary",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-error/10 text-error",
  DRAFT: "bg-surface-container-high text-on-surface",
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [submissions, setSubmissions] = useState<TemplateSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const pendingSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === "SUBMITTED"),
    [submissions]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [templatesResponse, submissionsResponse] = await Promise.all([
        fetch("/api/admin/templates"),
        fetch("/api/admin/template-submissions?status=SUBMITTED"),
      ]);

      if (!templatesResponse.ok || !submissionsResponse.ok) {
        throw new Error("Unable to load template marketplace data");
      }

      const [templatesPayload, submissionsPayload] = await Promise.all([
        templatesResponse.json(),
        submissionsResponse.json(),
      ]);

      setTemplates(Array.isArray(templatesPayload) ? templatesPayload : []);
      setSubmissions(Array.isArray(submissionsPayload) ? submissionsPayload : []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Unable to load template marketplace data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const toggleTemplate = async (
    id: string,
    field: "isActive" | "isPremium",
    currentValue: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (!response.ok) {
        throw new Error("Unable to update template");
      }

      await fetchData();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update template");
    }
  };

  const reviewSubmission = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/admin/template-submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewNotes: reviewNotes[id] ?? "",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Unable to review submission");
      }

      await fetchData();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Unable to review submission");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
            Template Marketplace
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Moderate creator submissions and manage the approved public template catalog.
          </p>
        </div>

        <div className="rounded-2xl bg-surface-container-low px-5 py-4 text-right">
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            Pending Reviews
          </p>
          <p className="mt-1 text-3xl font-headline font-extrabold text-primary">
            {pendingSubmissions.length}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface">Submitted Queue</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Review creator templates before they appear in the public marketplace.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <LoadingIndicator label="Loading moderation queue..." />
          </div>
        ) : pendingSubmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low p-10 text-center">
            <p className="text-on-surface-variant">No submitted templates are waiting for review.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {pendingSubmissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5"
              >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                          statusStyles[submission.status]
                        }`}
                      >
                        {submission.status}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Submitted by {submission.user.name || submission.user.email}
                      </span>
                    </div>

                    <h3 className="text-2xl font-headline font-bold text-on-surface">
                      {submission.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {submission.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {submission.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={reviewNotes[submission.id] ?? ""}
                      onChange={(event) =>
                        setReviewNotes((current) => ({
                          ...current,
                          [submission.id]: event.target.value,
                        }))
                      }
                      rows={5}
                      className="w-full rounded-xl border border-outline-variant/25 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Add review notes for the creator"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => reviewSubmission(submission.id, "approve")}
                        className="rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:opacity-90"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewSubmission(submission.id, "reject")}
                        className="rounded-xl bg-error/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-error transition hover:bg-error/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-headline font-bold text-on-surface">Approved Library</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage visibility, premium access, and creator ownership on public templates.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <LoadingIndicator label="Loading templates..." />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low p-10 text-center">
            <p className="text-on-surface-variant">No approved templates are available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.id}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {template.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">{template.name}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {template.creator?.name || template.creator?.email || "Platform template"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-on-surface-variant">
                      {template.portfolios.length} portfolios built
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTemplate(template.id, "isActive", template.isActive)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                        template.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container-high text-on-surface"
                      }`}
                    >
                      {template.isActive ? "Visible" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTemplate(template.id, "isPremium", template.isPremium)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                        template.isPremium
                          ? "bg-tertiary-container text-on-tertiary-container"
                          : "bg-surface-container-high text-on-surface"
                      }`}
                    >
                      {template.isPremium ? "Premium" : "Free"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
