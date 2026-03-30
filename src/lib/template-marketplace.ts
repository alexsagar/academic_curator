import { Prisma, TemplateSubmissionStatus } from "@prisma/client";
import type { ValidationResult } from "@/lib/validation";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const DEFAULT_TEMPLATE_CATEGORIES = [
  {
    slug: "it-professionals",
    name: "IT Professionals",
    description: "Templates for engineers, developers, analysts, and technical specialists.",
    icon: "code",
    sortOrder: 10,
  },
  {
    slug: "musicians",
    name: "Musicians",
    description: "Showcase performances, recordings, collaborations, and creative direction.",
    icon: "music_note",
    sortOrder: 20,
  },
  {
    slug: "artists",
    name: "Artists",
    description: "Portfolio layouts for visual artists, designers, and multidisciplinary studios.",
    icon: "palette",
    sortOrder: 30,
  },
  {
    slug: "researchers",
    name: "Researchers",
    description: "Highlight publications, grants, methods, and academic impact.",
    icon: "biotech",
    sortOrder: 40,
  },
  {
    slug: "students",
    name: "Students",
    description: "Launch a first professional portfolio with coursework, capstones, and achievements.",
    icon: "school",
    sortOrder: 50,
  },
  {
    slug: "educators",
    name: "Educators",
    description: "Present teaching philosophy, curriculum work, outcomes, and leadership.",
    icon: "menu_book",
    sortOrder: 60,
  },
  {
    slug: "entrepreneurs",
    name: "Entrepreneurs",
    description: "Pitch ventures, traction, strategy, and product storytelling in one place.",
    icon: "rocket_launch",
    sortOrder: 70,
  },
  {
    slug: "freelancers",
    name: "Freelancers",
    description: "Demonstrate client work, service positioning, testimonials, and delivery style.",
    icon: "work",
    sortOrder: 80,
  },
] as const;

export type TemplateSubmissionAction = "saveDraft" | "submit";
export type TemplateModerationAction = "approve" | "reject";

export interface TemplateSubmissionInput {
  title: string;
  description: string;
  thumbnail: string;
  demoUrl: string | null;
  tags: string[];
  categorySlugs: string[];
  htmlContent: string;
  cssContent: string;
  templateConfig: Prisma.InputJsonValue;
}

interface ValidationFailure {
  success: false;
  error: string;
}

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

function fail(error: string): ValidationFailure {
  return { success: false, error };
}

function succeed<T>(data: T): ValidationSuccess<T> {
  return { success: true, data };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function sanitizeTemplateText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\u0000/g, "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function sanitizeTemplateCode(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\u0000/g, "").trim().slice(0, maxLength);
}

export function sanitizeTemplateUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) {
    return null;
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function slugifyTemplateValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sanitizeTemplateCategorySlugs(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const slug = slugifyTemplateValue(item);
    if (slug && SLUG_RE.test(slug)) {
      unique.add(slug);
    }
  }

  return Array.from(unique).slice(0, 8);
}

export function sanitizeTemplateTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();

  for (const item of value) {
    const tag = sanitizeTemplateText(item, 40).toLowerCase();
    if (tag) {
      unique.add(tag);
    }
  }

  return Array.from(unique).slice(0, 12);
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  if (value === null) {
    return {};
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => toJsonValue(item)) as Prisma.InputJsonValue;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).slice(0, 50).map(([key, child]) => [
      sanitizeTemplateText(key, 80),
      toJsonValue(child),
    ]);

    return Object.fromEntries(entries) as Prisma.InputJsonValue;
  }

  return {};
}

export function sanitizeTemplateConfig(value: unknown): Prisma.InputJsonValue {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return {};
    }

    try {
      return toJsonValue(JSON.parse(trimmed));
    } catch {
      return {};
    }
  }

  return toJsonValue(value);
}

export function validateTemplateSubmissionInput(value: unknown): ValidationResult<TemplateSubmissionInput> {
  if (!isPlainObject(value)) {
    return fail("Invalid request body");
  }

  const title = sanitizeTemplateText(value.title, 120);
  if (!title) {
    return fail("Title is required");
  }

  const description = sanitizeTemplateText(value.description, 1200);
  if (!description) {
    return fail("Description is required");
  }

  const thumbnail = sanitizeTemplateUrl(value.thumbnail);
  if (!thumbnail) {
    return fail("A valid thumbnail URL is required");
  }

  const categorySlugs = sanitizeTemplateCategorySlugs(value.categorySlugs);
  if (categorySlugs.length === 0) {
    return fail("Select at least one category");
  }

  const htmlContent = sanitizeTemplateCode(value.htmlContent, 60_000);
  if (!htmlContent) {
    return fail("Template HTML content is required");
  }

  const cssContent = sanitizeTemplateCode(value.cssContent, 60_000);
  if (!cssContent) {
    return fail("Template CSS content is required");
  }

  return succeed({
    title,
    description,
    thumbnail,
    demoUrl: sanitizeTemplateUrl(value.demoUrl),
    tags: sanitizeTemplateTags(value.tags),
    categorySlugs,
    htmlContent,
    cssContent,
    templateConfig: sanitizeTemplateConfig(value.templateConfig),
  });
}

export function canEditTemplateSubmission(
  ownerId: string,
  actorId: string,
  status: TemplateSubmissionStatus
): boolean {
  return ownerId === actorId && status !== TemplateSubmissionStatus.APPROVED;
}

export function getTemplateSubmissionState(
  currentStatus: TemplateSubmissionStatus,
  action: TemplateSubmissionAction,
  now = new Date()
): {
  status: TemplateSubmissionStatus;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  adminReviewNotes?: string | null;
} {
  if (currentStatus === TemplateSubmissionStatus.APPROVED) {
    throw new Error("Approved submissions are locked");
  }

  if (action === "saveDraft") {
    return {
      status: TemplateSubmissionStatus.DRAFT,
      adminReviewNotes: null,
    };
  }

  return {
    status: TemplateSubmissionStatus.SUBMITTED,
    submittedAt: now,
    reviewedAt: null,
  };
}

export function getTemplateModerationState(
  currentStatus: TemplateSubmissionStatus,
  action: TemplateModerationAction,
  reviewNotes: string | null,
  now = new Date()
): {
  status: TemplateSubmissionStatus;
  adminReviewNotes?: string | null;
  reviewedAt?: Date | null;
} {
  if (currentStatus !== TemplateSubmissionStatus.SUBMITTED) {
    throw new Error("Only submitted templates can be reviewed");
  }

  return {
    status:
      action === "approve"
        ? TemplateSubmissionStatus.APPROVED
        : TemplateSubmissionStatus.REJECTED,
    adminReviewNotes: reviewNotes,
    reviewedAt: now,
  };
}

export function buildPublicTemplateWhere(
  q: string,
  categorySlug: string
): Prisma.TemplateWhereInput {
  const query = sanitizeTemplateText(q, 120);
  const normalizedCategory = slugifyTemplateValue(categorySlug);

  const where: Prisma.TemplateWhereInput = {
    isActive: true,
    approvalStatus: TemplateSubmissionStatus.APPROVED,
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { category: { contains: query, mode: "insensitive" } },
      { tags: { has: query.toLowerCase() } },
      {
        categoryLinks: {
          some: {
            category: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      },
    ];
  }

  if (normalizedCategory) {
    where.categoryLinks = {
      some: {
        category: {
          slug: normalizedCategory,
        },
      },
    };
  }

  return where;
}

function getTemplateSlugCandidate(base: string, attempt: number): string {
  return attempt === 0 ? base : `${base}-${attempt + 1}`;
}

export async function generateUniqueTemplateSlug(
  db: Prisma.TransactionClient | PrismaClientLike,
  title: string
): Promise<string> {
  const base = slugifyTemplateValue(title) || "template";

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = getTemplateSlugCandidate(base, attempt);
    const existing = await db.template.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  throw new Error("Unable to generate a unique template slug");
}

type PrismaClientLike = {
  template: {
    findUnique(args: {
      where: { slug: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
};
