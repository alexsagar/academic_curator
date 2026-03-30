"use client";

import { getPreviewModel, type PortfolioCustomizations } from "@/lib/portfolio";
import Icon from "@/components/ui/Icon";
import { getTemplateRenderer } from "@/lib/templates";
import type { Template } from "@prisma/client";

interface LivePreviewProps {
  template: unknown;
  customizations: unknown;
  device: "desktop" | "tablet" | "mobile";
}

interface ProjectPreviewItem {
  title: string;
  description: string;
  link: string | null;
  tags: string[];
}

interface TemplateIdentity {
  slug: string;
  category: string;
  name: string;
}

function asTemplateIdentity(template: unknown): TemplateIdentity {
  if (template && typeof template === "object") {
    const value = template as Record<string, unknown>;
    return {
      slug: typeof value.slug === "string" ? value.slug : "",
      category: typeof value.category === "string" ? value.category : "",
      name: typeof value.name === "string" ? value.name : "",
    };
  }

  return { slug: "", category: "", name: "" };
}

function normalizeTemplateKey(template: TemplateIdentity): string {
  const source = template.slug || template.name || template.category || "default";
  return source.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function toProjectItems(projects: unknown): ProjectPreviewItem[] {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects
    .map((project) => {
      if (!project || typeof project !== "object") {
        return null;
      }

      const value = project as Record<string, unknown>;
      const title = typeof value.title === "string" ? value.title.trim() : "";
      const description =
        typeof value.description === "string" ? value.description.trim() : "";
      const link = typeof value.link === "string" && value.link.trim() ? value.link.trim() : null;
      const tags = Array.isArray(value.tags)
        ? value.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        : [];

      if (!title && !description) {
        return null;
      }

      return {
        title: title || "Untitled Project",
        description: description || "Project details coming soon.",
        link,
        tags,
      };
    })
    .filter((project): project is ProjectPreviewItem => project !== null)
    .slice(0, 6);
}

function DefaultProjectCards({
  projects,
  primaryColor,
}: {
  projects: ProjectPreviewItem[];
  primaryColor: string;
}) {
  const items =
    projects.length > 0
      ? projects
      : [
          {
            title: "Featured Research",
            description:
              "Summarize your strongest project, thesis, or studio outcome here.",
            link: null,
            tags: ["Research"],
          },
          {
            title: "Case Study",
            description:
              "Highlight methodology, tooling, and the measurable result recruiters should notice.",
            link: null,
            tags: ["Portfolio"],
          },
        ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className="bg-white/70 backdrop-blur-sm p-8 rounded-xl border border-black/5 hover:-translate-y-1 transition-transform"
        >
          <div className="w-full aspect-video bg-black/5 rounded-lg mb-6 flex items-center justify-center">
            <Icon name="image" className="text-4xl opacity-30" />
          </div>
          <h4 className="text-xl font-bold mb-2">{item.title}</h4>
          <p className="opacity-70 text-sm mb-4 leading-relaxed">{item.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-black/5"
              >
                {tag}
              </span>
            ))}
          </div>
          {item.link ? (
            <a
              href={item.link}
              className="font-bold text-xs uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              Visit Project -&gt;
            </a>
          ) : (
            <span
              className="font-bold text-xs uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              Read Case Study -&gt;
            </span>
          )}
        </article>
      ))}
    </div>
  );
}

function MinimalTemplate({
  name,
  title,
  bio,
  avatar,
  projects,
  primaryColor,
}: {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  projects: ProjectPreviewItem[];
  primaryColor: string;
}) {
  return (
    <>
      <section className="max-w-6xl mx-auto px-6 sm:px-12 py-20 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-60 mb-4">
            Selected Portfolio
          </p>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">{name}</h1>
          <h2 className="text-2xl font-medium mb-6" style={{ color: primaryColor }}>
            {title}
          </h2>
          <p className="text-lg leading-relaxed opacity-80 max-w-3xl">{bio}</p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-black/10 shadow-xl bg-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt={name} className="w-full aspect-[4/5] object-cover" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-12 pb-20">
        <h3 className="text-sm uppercase tracking-[0.3em] font-bold opacity-50 mb-8">
          Selected Work
        </h3>
        <DefaultProjectCards projects={projects} primaryColor={primaryColor} />
      </section>
    </>
  );
}

function JournalTemplate({
  name,
  title,
  bio,
  avatar,
  projects,
  primaryColor,
}: {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  projects: ProjectPreviewItem[];
  primaryColor: string;
}) {
  const items = projects.length > 0 ? projects : [];

  return (
    <>
      <section className="border-b border-black/10">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-20 text-center">
          <p className="text-sm uppercase tracking-[0.35em] font-bold opacity-50 mb-6">
            Academic Journal
          </p>
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-8 border-4 border-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">{name}</h1>
          <h2 className="text-xl sm:text-2xl font-medium mb-8" style={{ color: primaryColor }}>
            {title}
          </h2>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed opacity-80">{bio}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-12 py-16 space-y-8">
        {(items.length > 0 ? items : [
          {
            title: "Long-form Research Feature",
            description:
              "Use this template when your portfolio needs narrative depth, chronology, and publication-style structure.",
            link: null,
            tags: ["Narrative"],
          },
        ]).map((item, index) => (
          <article key={`${item.title}-${index}`} className="border-b border-black/10 pb-8">
            <p className="text-xs uppercase tracking-[0.25em] font-bold opacity-50 mb-3">
              Feature {index + 1}
            </p>
            <h3 className="text-3xl font-bold mb-3">{item.title}</h3>
            <p className="text-base leading-relaxed opacity-80 mb-4">{item.description}</p>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-black/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function GridTemplate({
  name,
  title,
  bio,
  avatar,
  projects,
  primaryColor,
}: {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  projects: ProjectPreviewItem[];
  primaryColor: string;
}) {
  return (
    <>
      <section className="max-w-6xl mx-auto px-6 sm:px-12 py-16">
        <div className="rounded-[2rem] overflow-hidden bg-black/5 p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-center">
          <div className="rounded-[2rem] overflow-hidden border border-white/30 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={name} className="w-full aspect-[4/5] object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-50 mb-4">
              Showcase Mode
            </p>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">{name}</h1>
            <h2 className="text-2xl font-medium mb-6" style={{ color: primaryColor }}>
              {title}
            </h2>
            <p className="text-lg leading-relaxed opacity-80 max-w-3xl">{bio}</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 sm:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(projects.length > 0 ? projects : [
            {
              title: "Studio Feature",
              description: "A bold project card for visual, design, and interdisciplinary work.",
              link: null,
              tags: ["Studio"],
            },
            {
              title: "Technical Project",
              description: "Highlight implementation details, results, and impact in a dense but readable format.",
              link: null,
              tags: ["Technical"],
            },
            {
              title: "Published Work",
              description: "Use the flexible grid to combine papers, capstones, and artifacts in one portfolio.",
              link: null,
              tags: ["Publication"],
            },
          ]).map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-3xl bg-white/75 border border-black/5 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                <Icon name="auto_awesome" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm leading-relaxed opacity-75 mb-4">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-black/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default function LivePreview({ template, customizations, device }: LivePreviewProps) {
  const preview = getPreviewModel(customizations);
  const { content, styles, images } = preview;
  const templateIdentity = asTemplateIdentity(template);
  const templateKey = normalizeTemplateKey(templateIdentity);
  const projects = toProjectItems((customizations as { content?: { projects?: unknown } } | null)?.content?.projects);

  const templateVariant =
    templateKey.includes("journal") ||
    templateKey.includes("monograph") ||
    templateKey.includes("lexicon")
      ? "journal"
      : templateKey.includes("curator") ||
          templateKey.includes("avant") ||
          templateIdentity.category.toLowerCase() === "creative"
        ? "grid"
        : "minimal";

  const Renderer = getTemplateRenderer(templateIdentity.slug)?.component;

  if (Renderer) {
    return (
      <div
        className={`w-full h-full overflow-y-auto ${device === "mobile" ? "no-scrollbar" : ""}`}
        style={{
          backgroundColor: styles.surfaceColor,
          color: styles.textColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
        }}
      >
        <Renderer
          template={template as Template}
          customizations={customizations as PortfolioCustomizations}
          device={device}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full overflow-y-auto ${device === "mobile" ? "no-scrollbar" : ""}`}
      style={{
        backgroundColor: styles.surfaceColor,
        color: styles.textColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
      }}
    >
      {templateVariant === "journal" ? (
        <JournalTemplate
          name={content.name}
          title={content.title}
          bio={content.bio}
          avatar={images.avatar}
          projects={projects}
          primaryColor={styles.primaryColor}
        />
      ) : templateVariant === "grid" ? (
        <GridTemplate
          name={content.name}
          title={content.title}
          bio={content.bio}
          avatar={images.avatar}
          projects={projects}
          primaryColor={styles.primaryColor}
        />
      ) : (
        <MinimalTemplate
          name={content.name}
          title={content.title}
          bio={content.bio}
          avatar={images.avatar}
          projects={projects}
          primaryColor={styles.primaryColor}
        />
      )}
    </div>
  );
}
