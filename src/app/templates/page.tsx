"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import InputWithIcon from "@/components/ui/InputWithIcon";
import Icon from "@/components/ui/Icon";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
  avgRating: string;
  ratingsCount: number;
}

interface TemplatesResponse {
  templates: Template[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const categoryColors: Record<string, string> = {
  Modern: "text-primary",
  Classic: "text-tertiary",
  Creative: "text-primary-container",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ["All Templates", "Modern", "Classic", "Creative"];

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const catQuery = activeCategory === "All Templates" ? "" : activeCategory;
        const res = await fetch(
          `/api/templates?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(catQuery)}&page=${page}&pageSize=12`
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Failed to load templates");
        }
        const data = (await res.json()) as TemplatesResponse;
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setTemplates([]);
        setTotalPages(1);
        setError(err instanceof Error ? err.message : "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTemplates, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeCategory, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 min-h-screen">
        {/* Hero & Search */}
        <section className="max-w-7xl mx-auto px-6 mb-16 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tighter text-on-surface mb-6">
                Curate Your <span className="text-primary">Professional Narrative</span>
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed font-medium">
                Explore our high-end, editorially designed templates. Every layout is
                fully customizable, built to showcase your academic journey.
              </p>
            </div>
            
            <InputWithIcon
              icon="search"
              type="text"
              placeholder="Search templates (e.g., 'Modern', 'Minimal')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              wrapperClassName="w-full md:w-auto min-w-[300px]"
              inputClassName="h-14 rounded-full"
            />
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-full no-scrollbar overflow-x-auto w-max mx-auto md:mx-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Template Grid */}
        <section className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-on-surface-variant">
              <LoadingIndicator
                label="Curating templates..."
                className="flex-col gap-4"
                iconClassName="text-4xl text-primary"
              />
            </div>
          ) : error ? (
            <div className="py-20 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
              <Icon name="database" className="text-5xl text-error mb-4" />
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">Templates unavailable</h3>
              <p className="text-on-surface-variant max-w-xl mx-auto">{error}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-20 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
              <Icon name="search_off" className="text-5xl text-outline mb-4" />
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">No templates found</h3>
              <p className="text-on-surface-variant">Try adjusting your search or category filters.</p>
              <button 
                onClick={() => {setSearchQuery(""); setActiveCategory("All Templates"); setPage(1);}}
                className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold uppercase tracking-widest text-xs rounded hover:bg-primary/20 transition-colors"
                >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {templates.map((t) => (
                <div key={t.id} className="group h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-low mb-6 border border-outline-variant/15 shadow-sm">
                    {t.thumbnail && t.thumbnail !== "" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105">
                        <Icon name="web" className="text-7xl text-on-surface-variant/20" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className={`bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] w-max font-bold tracking-widest uppercase border border-outline-variant/15 ${categoryColors[t.category] || "text-primary"}`}>
                        {t.category}
                      </span>
                      {t.isPremium && (
                        <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] w-max font-bold tracking-widest uppercase border border-tertiary-container shadow-md inline-flex items-center gap-1">
                          <Icon name="star" filled className="text-[12px]" /> Premium
                        </span>
                      )}
                    </div>
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold font-headline text-balance">{t.name}</h3>
                      <div className="inline-flex items-center gap-1 self-start bg-surface-container-low px-2.5 py-1 rounded-full shadow-sm border border-outline-variant/20">
                        <Icon name="star" filled className="text-[14px] text-[#f59e0b]" />
                        <span className="text-xs font-bold">{t.avgRating || "5.0"}</span>
                        <span className="text-[10px] text-on-surface-variant ml-1">({t.ratingsCount})</span>
                      </div>
                    </div>
                    <p className="flex-1 text-on-surface-variant mb-6 text-sm leading-relaxed">{t.description}</p>
                    <div className="mt-auto flex gap-3">
                      <button className="flex-1 py-3 bg-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-widest rounded-md hover:bg-surface-container-high transition-colors">
                        Preview
                      </button>
                      <Link
                        href="/dashboard/portfolio/new"
                        className="flex-1 py-3 gradient-primary text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all text-center"
                      >
                        Use Template
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {!loading && !error && totalPages > 1 && (
          <div className="max-w-7xl mx-auto px-6 mt-12 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="px-5 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold disabled:opacity-50"
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
              className="px-5 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 mt-32">
          <div className="bg-on-surface rounded-2xl p-12 md:p-20 flex flex-col items-center text-center shadow-xl">
            <h2 className="text-surface font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
              Ready to build your legacy?
            </h2>
            <p className="text-surface/70 max-w-2xl text-lg mb-10 font-body leading-relaxed">
              Select a template and start customizing. No coding required, just
              your vision and our editorial tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="px-10 py-4 gradient-primary text-white rounded-md font-bold text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                Get Started for Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
