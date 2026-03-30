"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import InputWithIcon from "@/components/ui/InputWithIcon";
import Icon from "@/components/ui/Icon";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

interface TemplateCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  templatesCount: number;
}

interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  thumbnail: string;
  demoUrl: string | null;
  isPremium: boolean;
  avgRating: string;
  ratingsCount: number;
  categories: TemplateCategory[];
}

interface TemplatesResponse {
  templates: Template[];
  categories: TemplateCategory[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function TemplatesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "");
  const [page, setPage] = useState(Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
    setActiveCategory(searchParams.get("category") ?? "");
    setPage(Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (activeCategory) {
      params.set("category", activeCategory);
    }
    if (page > 1) {
      params.set("page", String(page));
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [activeCategory, page, pathname, router, searchQuery]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/templates?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(activeCategory)}&page=${page}&pageSize=12`
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Failed to load templates");
        }

        const data = (await response.json()) as TemplatesResponse;
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } catch (fetchError) {
        setTemplates([]);
        setCategories([]);
        setTotalPages(1);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTemplates, 250);
    return () => clearTimeout(timer);
  }, [activeCategory, page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20">
        <section className="mx-auto mb-16 max-w-7xl px-6">
          <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="mb-5 text-5xl font-headline font-extrabold tracking-tight text-on-surface md:text-6xl">
                Category-Based Template Marketplace
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                Browse profession-specific templates for researchers, artists, students, educators,
                musicians, and other creators building their public narrative.
              </p>
            </div>

            <InputWithIcon
              icon="search"
              type="text"
              placeholder="Search templates, audiences, or keywords"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              wrapperClassName="w-full lg:w-[360px]"
              inputClassName="h-14 rounded-full"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory("")}
              className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                activeCategory === ""
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                  activeCategory === category.slug
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {category.icon ? <Icon name={category.icon} className="text-base" /> : null}
                {category.name}
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                  {category.templatesCount}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-outline-variant/20 bg-surface-container-lowest">
              <LoadingIndicator
                label="Loading marketplace templates..."
                className="flex-col gap-4"
                iconClassName="text-4xl text-primary"
              />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-8 py-16 text-center">
              <Icon name="error" className="mx-auto mb-4 text-5xl text-error" />
              <h2 className="text-2xl font-headline font-bold text-on-surface">Templates unavailable</h2>
              <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">{error}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-8 py-16 text-center">
              <Icon name="search_off" className="mx-auto mb-4 text-5xl text-outline" />
              <h2 className="text-2xl font-headline font-bold text-on-surface">No templates found</h2>
              <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
                Try a different search term or switch to another professional category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("");
                  setPage(1);
                }}
                className="mt-6 rounded-full bg-primary/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary transition hover:bg-primary/20"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <article
                  key={template.id}
                  className="group flex h-full flex-col rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative mb-5 overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low">
                    {template.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container">
                        <Icon name="web" className="text-6xl text-on-surface-variant/20" />
                      </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {template.categories.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur"
                        >
                          {category.name}
                        </span>
                      ))}
                      {template.isPremium ? (
                        <span className="rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">
                          Premium
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-headline font-bold text-on-surface">{template.name}</h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        {template.category}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface">
                      <Icon name="star" filled className="text-sm text-amber-500" />
                      {template.avgRating}
                      <span className="text-on-surface-variant">({template.ratingsCount})</span>
                    </div>
                  </div>

                  <p className="mb-5 flex-1 text-sm leading-relaxed text-on-surface-variant">
                    {template.description}
                  </p>

                  <div className="flex gap-3">
                    <Link
                      href={template.demoUrl || "/dashboard/portfolio/new"}
                      className="flex-1 rounded-xl border border-outline-variant/25 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-container-high"
                    >
                      Preview
                    </Link>
                    <Link
                      href="/dashboard/portfolio/new"
                      className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
                    >
                      Use Template
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {!loading && !error && totalPages > 1 ? (
          <div className="mx-auto mt-12 flex max-w-7xl items-center justify-center gap-4 px-6">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="rounded-full border border-outline-variant/30 px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-outline-variant/30 px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}

        <section className="mx-auto mt-28 max-w-7xl px-6">
          <div className="rounded-3xl bg-on-surface px-8 py-16 text-center shadow-xl md:px-14">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-surface md:text-5xl">
              Publish templates for your audience
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-surface/75">
              Designers and creators can submit new templates through the dashboard, where admins
              review and approve them for the public marketplace.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard/templates"
                className="rounded-xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary transition hover:bg-surface"
              >
                Creator Dashboard
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
