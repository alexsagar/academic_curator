"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface TemplateCategoryOption {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
}

interface ExistingSubmission {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  demoUrl: string | null;
  tags: string[];
  htmlContent: string;
  cssContent: string;
  templateConfig: unknown;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  adminReviewNotes: string | null;
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    icon: string | null;
  }>;
}

interface TemplateSubmissionFormProps {
  categories: TemplateCategoryOption[];
  submission?: ExistingSubmission;
}

function formatConfig(value: unknown): string {
  if (!value) {
    return "{}";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

export default function TemplateSubmissionForm({
  categories,
  submission,
}: TemplateSubmissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(submission?.title ?? "");
  const [description, setDescription] = useState(submission?.description ?? "");
  const [thumbnail, setThumbnail] = useState(submission?.thumbnail ?? "");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [demoUrl, setDemoUrl] = useState(submission?.demoUrl ?? "");
  const [tagsInput, setTagsInput] = useState(submission?.tags.join(", ") ?? "");
  const [htmlContent, setHtmlContent] = useState(submission?.htmlContent ?? "");
  const [cssContent, setCssContent] = useState(submission?.cssContent ?? "");
  const [templateConfig, setTemplateConfig] = useState(formatConfig(submission?.templateConfig));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    submission?.categories.map((category) => category.slug) ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const modeLabel = useMemo(() => {
    if (!submission) {
      return "Create Template Submission";
    }

    if (submission.status === "REJECTED") {
      return "Revise Rejected Submission";
    }

    return "Edit Template Submission";
  }, [submission]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  };

  const handleThumbnailUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setThumbnailUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("kind", "banner");

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Unable to upload thumbnail");
      }

      const payload = (await response.json()) as { url: string };
      setThumbnail(payload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload thumbnail");
    } finally {
      setThumbnailUploading(false);
      event.target.value = "";
    }
  };

  const submit = (action: "saveDraft" | "submit") => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          submission
            ? `/api/dashboard/template-submissions/${submission.id}`
            : "/api/dashboard/template-submissions",
          {
            method: submission ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action,
              title,
              description,
              thumbnail,
              demoUrl,
              tags: tagsInput
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              categorySlugs: selectedCategories,
              htmlContent,
              cssContent,
              templateConfig,
            }),
          }
        );

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          throw new Error(payload?.error || "Unable to save submission");
        }

        setSuccess(action === "submit" ? "Submission sent for review." : "Draft saved.");
        router.push("/dashboard/templates");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to save submission");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
              {modeLabel}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              Build a reusable marketplace template with categories, metadata, preview assets, and
              the HTML/CSS payload used by the current renderer.
            </p>
          </div>
          {submission?.status ? (
            <span className="inline-flex items-center rounded-full bg-surface-container-high px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-on-surface">
              {submission.status}
            </span>
          ) : null}
        </div>

        {submission?.adminReviewNotes ? (
          <div className="mb-6 rounded-xl border border-error/15 bg-error/5 p-4 text-sm text-on-surface">
            <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-widest text-error">
              <Icon name="feedback" className="text-base" />
              Review Notes
            </div>
            <p className="text-on-surface-variant">{submission.adminReviewNotes}</p>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Researcher Portfolio System"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Describe the audience, visual direction, and the kinds of work this template is designed to present."
              />
            </label>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-on-surface">Thumbnail URL</span>
                <input
                  value={thumbnail}
                  onChange={(event) => setThumbnail(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="https://..."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-on-surface">Demo URL</span>
                <input
                  value={demoUrl}
                  onChange={(event) => setDemoUrl(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="https://demo.example.com"
                />
              </label>
            </div>

            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-on-surface">Thumbnail Upload</h2>
                  <p className="text-xs text-on-surface-variant">
                    Upload a banner image or paste a hosted thumbnail URL.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
                  <Icon name={thumbnailUploading ? "progress_activity" : "upload"} className="text-base" />
                  {thumbnailUploading ? "Uploading" : "Upload"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={thumbnailUploading}
                  />
                </label>
              </div>

              {thumbnail ? (
                <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail} alt="Template thumbnail preview" className="aspect-[16/9] w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-outline-variant/30 bg-white text-sm text-on-surface-variant">
                  Thumbnail preview will appear here.
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">Tags</span>
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="minimal, research, academic, editorial"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">HTML Content</span>
              <textarea
                value={htmlContent}
                onChange={(event) => setHtmlContent(event.target.value)}
                rows={12}
                className="w-full rounded-xl border border-outline-variant/30 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="<section>...</section>"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">CSS Content</span>
              <textarea
                value={cssContent}
                onChange={(event) => setCssContent(event.target.value)}
                rows={12}
                className="w-full rounded-xl border border-outline-variant/30 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder=".template-shell { display: grid; }"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-on-surface">Template Config JSON</span>
              <textarea
                value={templateConfig}
                onChange={(event) => setTemplateConfig(event.target.value)}
                rows={10}
                className="w-full rounded-xl border border-outline-variant/30 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder='{"palette":"neutral"}'
              />
            </label>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
              <h2 className="mb-2 text-lg font-headline font-bold text-on-surface">Categories</h2>
              <p className="mb-4 text-sm text-on-surface-variant">
                Select one or more professional audiences for this template.
              </p>
              <div className="space-y-3">
                {categories.map((category) => {
                  const selected = selectedCategories.includes(category.slug);
                  return (
                    <label
                      key={category.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/20 bg-white hover:border-outline-variant/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCategory(category.slug)}
                        className="mt-1 h-4 w-4 rounded border-outline-variant/40 text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                          {category.icon ? <Icon name={category.icon} className="text-base text-primary" /> : null}
                          {category.name}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {category.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
              <h2 className="mb-2 text-lg font-headline font-bold text-on-surface">Submission Actions</h2>
              <p className="mb-5 text-sm text-on-surface-variant">
                Save a draft to continue later, or submit the template for admin review and publication.
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => submit("saveDraft")}
                  disabled={isPending || thumbnailUploading}
                  className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-container-high disabled:opacity-60"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => submit("submit")}
                  disabled={isPending || thumbnailUploading}
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-60"
                >
                  {submission?.status === "REJECTED" ? "Resubmit for Review" : "Submit for Review"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
