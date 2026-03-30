"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

interface ModerationSubmission {
  id: string;
  title: string;
  description: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "DRAFT";
  adminReviewNotes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  user: {
    name: string | null;
    email: string;
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
}

const tabConfig = [
  { id: "SUBMITTED", label: "Requires Action" },
  { id: "REJECTED", label: "Rejected" },
  { id: "APPROVED", label: "Approved" },
] as const;

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabConfig)[number]["id"]>("SUBMITTED");
  const [items, setItems] = useState<ModerationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/template-submissions?status=${status}`);
      if (!response.ok) {
        throw new Error("Unable to load moderation items");
      }

      const payload = await response.json();
      setItems(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load moderation items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems(activeTab);
  }, [activeTab, fetchItems]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-headline font-extrabold tracking-tight text-on-surface">
          Moderation Queue
        </h1>
        <p className="text-sm text-on-surface-variant">
          Review creator template submissions and inspect the approval history by status.
        </p>
      </div>

      <div className="flex gap-4 border-b border-outline-variant/20">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`relative pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab.id
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-primary"></span>
            ) : null}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-12 text-center">
          <LoadingIndicator label="Loading moderation items..." />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
          <p className="text-on-surface-variant">No moderation items in this state.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon name="dashboard_customize" />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Template Submission
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {item.submittedAt
                          ? `Submitted ${new Date(item.submittedAt).toLocaleDateString()}`
                          : `Created ${new Date(item.reviewedAt || Date.now()).toLocaleDateString()}`}
                      </span>
                    </div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {item.description}
                    </p>
                    <p className="mt-3 text-sm text-on-surface-variant">
                      Creator: <span className="font-semibold text-on-surface">{item.user.name || item.user.email}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    {item.adminReviewNotes ? (
                      <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                        {item.adminReviewNotes}
                      </div>
                    ) : null}
                  </div>
                </div>

                <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface">
                  {item.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
