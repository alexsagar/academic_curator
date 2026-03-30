import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  canEditTemplateSubmission,
  getTemplateSubmissionState,
  validateTemplateSubmissionInput,
} from "@/lib/template-marketplace";

function sanitizeAction(value: unknown): "saveDraft" | "submit" {
  return value === "submit" ? "submit" : "saveDraft";
}

async function getSubmission(id: string, userId: string) {
  return prisma.templateSubmission.findFirst({
    where: { id, userId },
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
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await getSubmission(id, session.user.id);

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...submission,
    categories: submission.categories.map((item) => item.category),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.templateSubmission.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!existing || !canEditTemplateSubmission(existing.userId, session.user.id, existing.status)) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
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

  let state;
  try {
    state = getTemplateSubmissionState(existing.status, action);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update submission" },
      { status: 400 }
    );
  }

  const submission = await prisma.templateSubmission.update({
    where: { id: existing.id },
    data: {
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
        deleteMany: {},
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

  return NextResponse.json({
    ...submission,
    categories: submission.categories.map((item) => item.category),
  });
}
