import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { clampInteger } from "@/lib/validation";
import { CACHE_TAGS } from "@/lib/cache";
import { logger } from "@/lib/logger";

async function fetchTemplates(
  q: string,
  category: string,
  page: number,
  pageSize: number
) {
  const where: Prisma.TemplateWhereInput = { isActive: true };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category && category !== "All" && category !== "All Templates") {
    where.category = category;
  }

  const [total, templates] = await Promise.all([
    prisma.template.count({ where }),
    prisma.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        thumbnail: true,
        isPremium: true,
      },
    }),
  ]);

  const ratings = templates.length
    ? await prisma.templateRating.groupBy({
        by: ["templateId"],
        where: {
          templateId: {
            in: templates.map((template) => template.id),
          },
        },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  const ratingMap = new Map(
    ratings.map((rating) => [
      rating.templateId,
      {
        avgRating: rating._avg.rating ? rating._avg.rating.toFixed(1) : "0.0",
        ratingsCount: rating._count.rating,
      },
    ])
  );

  return {
    templates: templates.map((template) => {
      const rating = ratingMap.get(template.id);
      return {
        ...template,
        avgRating: rating?.avgRating ?? "0.0",
        ratingsCount: rating?.ratingsCount ?? 0,
      };
    }),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = clampInteger(searchParams.get("page"), 1, 1, 10_000);
    const pageSize = clampInteger(searchParams.get("pageSize"), 12, 1, 24);

    const cacheKey = `templates:${q}:${category}:${page}:${pageSize}`;

    const cachedFetch = unstable_cache(
      () => fetchTemplates(q, category, page, pageSize),
      [cacheKey],
      { tags: [CACHE_TAGS.templates], revalidate: 60 }
    );

    const data = await cachedFetch();
    return NextResponse.json(data);
  } catch (error) {
    logger.error("Templates API Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Templates are temporarily unavailable. Check your database connection." },
      { status: 500 }
    );
  }
}
