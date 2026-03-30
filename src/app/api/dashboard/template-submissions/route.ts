import { NextResponse } from "next/server";
import { TemplateSubmissionStatus } from "@prisma/client";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getTemplateSubmissionState,
  validateTemplateSubmissionInput,
} from "@/lib/template-marketplace";

function sanitizeAction(value: unknown): "saveDraft" | "submit" {
  return value === "submit" ? "submit" : "saveDraft";
}

export async function GET() {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.templateSubmission.findMany({
    where: { userId: session.user.id },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      categories: {
        select: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: {
          category: {
            sortOrder: "asc",
          },
        },
      },
      publishedTemplate: {
        select: {
          id: true,
          slug: true,
          isActive: true,
          isPremium: true,
        },
      },
    },
  });

  return NextResponse.json(
    submissions.map((submission) => ({
      ...submission,
      categories: submission.categories.map((item) => item.category),
    }))
  );
}

export async function POST(request: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = sanitizeAction(body.action);
  const validated = validateTemplateSubmissionInput(body);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const categories = await prisma.templateCategory.findMany({
    where: { slug: { in: validated.data.categorySlugs } },
    select: { id: true, slug: true },
  });

  if (categories.length !== validated.data.categorySlugs.length) {
    return NextResponse.json({ error: "One or more categories are invalid" }, { status: 400 });
  }

  const state = getTemplateSubmissionState(TemplateSubmissionStatus.DRAFT, action);

  const submission = await prisma.templateSubmission.create({
    data: {
      userId: session.user.id,
      title: validated.data.title,
      description: validated.data.description,
      thumbnail: validated.data.thumbnail,
      demoUrl: validated.data.demoUrl,
      tags: validated.data.tags,
      htmlContent: validated.data.htmlContent,
      cssContent: validated.data.cssContent,
      templateConfig: validated.data.templateConfig,
      status: state.status,
      submittedAt: state.submittedAt,
      reviewedAt: state.reviewedAt,
      adminReviewNotes: state.adminReviewNotes,
      categories: {
        create: categories.map((category) => ({
          categoryId: category.id,
        })),
      },
    },
    include: {
      categories: {
        select: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              icon: true,
            },
          },
        },
      },
      publishedTemplate: {
        select: {
          id: true,
          slug: true,
          isActive: true,
          isPremium: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      ...submission,
      categories: submission.categories.map((item) => item.category),
    },
    { status: 201 }
  );
}
