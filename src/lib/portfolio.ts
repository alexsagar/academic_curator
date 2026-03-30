import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

const COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const FONT_SIZE_RE = /^(1[2-9]|20)px$/;
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

const ALLOWED_FONTS = [
  "Inter",
  "Manrope",
  "Roboto",
  "Playfair Display",
  "Merriweather",
  "sans-serif",
] as const;

type AllowedFont = (typeof ALLOWED_FONTS)[number];

export interface PortfolioContent {
  name: string;
  title: string;
  bio: string;
  projects: unknown[];
  education: unknown[];
  skills: unknown[];
}

export interface PortfolioStyles {
  primaryColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: AllowedFont;
  fontSize: string;
  spacing: "compact" | "comfortable" | "spacious";
}

export interface PortfolioImages {
  avatar: string;
  banner: string;
}

export interface PortfolioCustomizations {
  content: PortfolioContent;
  styles: PortfolioStyles;
  images: PortfolioImages;
}

export const DEFAULT_CUSTOMIZATIONS: PortfolioCustomizations = {
  content: {
    name: "",
    title: "",
    bio: "",
    projects: [],
    education: [],
    skills: [],
  },
  styles: {
    primaryColor: "#006591",
    surfaceColor: "#f7f9fb",
    textColor: "#191c1e",
    fontFamily: "Inter",
    fontSize: "16px",
    spacing: "comfortable",
  },
  images: {
    avatar: "",
    banner: "",
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function sanitizeColor(value: unknown, fallback: string): string {
  return typeof value === "string" && COLOR_RE.test(value) ? value : fallback;
}

function sanitizeFontFamily(value: unknown, fallback: AllowedFont): AllowedFont {
  return typeof value === "string" &&
    (ALLOWED_FONTS as readonly string[]).includes(value)
    ? (value as AllowedFont)
    : fallback;
}

function sanitizeFontSize(value: unknown, fallback: string): string {
  return typeof value === "string" && FONT_SIZE_RE.test(value) ? value : fallback;
}

function sanitizeImageUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  // Legacy local storage paths (STORAGE_PROVIDER=local)
  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  // Full URLs from S3/R2/MinIO or external sources
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function sanitizePortfolioCustomizations(input: unknown): PortfolioCustomizations {
  const root = asRecord(input);
  const content = asRecord(root.content);
  const styles = asRecord(root.styles);
  const images = asRecord(root.images);

  return {
    content: {
      name: sanitizeText(content.name, 120),
      title: sanitizeText(content.title, 160),
      bio: sanitizeText(content.bio, 2000),
      projects: Array.isArray(content.projects) ? content.projects : [],
      education: Array.isArray(content.education) ? content.education : [],
      skills: Array.isArray(content.skills) ? content.skills : [],
    },
    styles: {
      primaryColor: sanitizeColor(styles.primaryColor, DEFAULT_CUSTOMIZATIONS.styles.primaryColor),
      surfaceColor: sanitizeColor(styles.surfaceColor, DEFAULT_CUSTOMIZATIONS.styles.surfaceColor),
      textColor: sanitizeColor(styles.textColor, DEFAULT_CUSTOMIZATIONS.styles.textColor),
      fontFamily: sanitizeFontFamily(styles.fontFamily, DEFAULT_CUSTOMIZATIONS.styles.fontFamily),
      fontSize: sanitizeFontSize(styles.fontSize, DEFAULT_CUSTOMIZATIONS.styles.fontSize),
      spacing:
        styles.spacing === "compact" || styles.spacing === "spacious" || styles.spacing === "comfortable"
          ? styles.spacing
          : DEFAULT_CUSTOMIZATIONS.styles.spacing,
    },
    images: {
      avatar: sanitizeImageUrl(images.avatar),
      banner: sanitizeImageUrl(images.banner),
    },
  };
}

export function toPortfolioJsonValue(
  customizations: PortfolioCustomizations
): Prisma.InputJsonValue {
  return customizations as unknown as Prisma.InputJsonValue;
}

export function getPreviewModel(customizations: unknown) {
  const sanitized = sanitizePortfolioCustomizations(customizations);

  return {
    content: {
      name: sanitized.content.name || "Your Name",
      title: sanitized.content.title || "Your Professional Title",
      bio:
        sanitized.content.bio ||
        "Your biographical summary will appear here. Add details in the Content tab to make your portfolio stand out.",
    },
    styles: sanitized.styles,
    images: {
      avatar: sanitized.images.avatar || DEFAULT_AVATAR,
      banner: sanitized.images.banner,
    },
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createSlugBase(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "portfolio";
}

type PortfolioWriteClient = Prisma.TransactionClient | typeof prisma;

function isSlugConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("slug")
  );
}

function getSlugCandidate(base: string, attempt: number): string {
  return attempt === 0 ? base : `${base}-${attempt + 1}`;
}

export async function generateUniquePortfolioSlug(title: string): Promise<string> {
  const base = createSlugBase(title);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = getSlugCandidate(base, attempt);
    const existing = await prisma.portfolio.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  throw new Error("Unable to generate a unique portfolio slug");
}

export async function createPortfolioWithUniqueSlug(
  db: PortfolioWriteClient,
  data: Omit<Prisma.PortfolioCreateInput, "slug" | "user" | "template"> & {
    userId: string;
    templateId: string;
  }
) {
  const base = createSlugBase(data.title);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = getSlugCandidate(base, attempt);

    try {
      return await db.portfolio.create({
        data: {
          title: data.title,
          slug,
          user: { connect: { id: data.userId } },
          template: { connect: { id: data.templateId } },
          customizations: data.customizations,
          progress: data.progress,
          status: data.status,
        },
      });
    } catch (error) {
      if (isSlugConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to create portfolio with a unique slug");
}

export async function ensurePortfolioSlug(
  db: PortfolioWriteClient,
  portfolioId: string,
  title: string
): Promise<string> {
  const base = createSlugBase(title);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = getSlugCandidate(base, attempt);

    try {
      const updated = await db.portfolio.update({
        where: { id: portfolioId },
        data: { slug },
        select: { slug: true },
      });

      return updated.slug ?? slug;
    } catch (error) {
      if (isSlugConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to assign a unique portfolio slug");
}
