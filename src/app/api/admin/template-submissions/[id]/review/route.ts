import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidateTemplates } from "@/lib/cache";
import {
  generateUniqueTemplateSlug,
  getTemplateModerationState,
  sanitizeTemplateConfig,
  sanitizeTemplateText,
} from "@/lib/template-marketplace";

function normalizeReviewAction(value: unknown): "approve" | "reject" | null {
  if (value === "approve" || value === "reject") {
    return value;
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const action = normalizeReviewAction(body.action);
  const reviewNotes = sanitizeTemplateText(body.reviewNotes, 2000) || null;
  const isPremium = body.isPremium === true;

  if (!action) {
    return NextResponse.json({ error: "Invalid review action" }, { status: 400 });
  }

  const submission = await prisma.templateSubmission.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
        orderBy: {
          category: {
            sortOrder: "asc",
          },
        },
      },
      publishedTemplate: true,
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  let state;
  try {
    state = getTemplateModerationState(submission.status, action, reviewNotes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to review submission" },
      { status: 400 }
    );
  }

  const categoryIds = submission.categories.map((item) => item.categoryId);
  const primaryCategory = submission.categories[0]?.category;

  if (action === "approve" && categoryIds.length === 0) {
    return NextResponse.json({ error: "Submission must include at least one category" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedSubmission = await tx.templateSubmission.update({
      where: { id: submission.id },
      data: {
        status: state.status,
        adminReviewNotes: state.adminReviewNotes,
        reviewedAt: state.reviewedAt,
      },
    });

    let template = submission.publishedTemplate;

    if (action === "approve" && primaryCategory) {
      if (template) {
        template = await tx.template.update({
          where: { id: template.id },
          data: {
            name: submission.title,
            category: primaryCategory.name,
            description: submission.description,
            thumbnail: submission.thumbnail,
            demoUrl: submission.demoUrl,
            htmlContent: submission.htmlContent,
            cssContent: submission.cssContent,
            templateConfig: sanitizeTemplateConfig(submission.templateConfig),
            tags: submission.tags,
            isPremium,
            isActive: true,
            approvalStatus: "APPROVED",
            creatorId: submission.userId,
            categoryLinks: {
              deleteMany: {},
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
          },
        });
      } else {
        const slug = await generateUniqueTemplateSlug(tx, submission.title);
        template = await tx.template.create({
          data: {
            name: submission.title,
            slug,
            category: primaryCategory.name,
            description: submission.description,
            thumbnail: submission.thumbnail,
            demoUrl: submission.demoUrl,
            htmlContent: submission.htmlContent,
            cssContent: submission.cssContent,
            templateConfig: sanitizeTemplateConfig(submission.templateConfig),
            tags: submission.tags,
            isPremium,
            isActive: true,
            approvalStatus: "APPROVED",
            creatorId: submission.userId,
            submissionId: submission.id,
            categoryLinks: {
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
          },
        });
      }
    }

    return { updatedSubmission, template };
  });

  if (action === "approve") {
    revalidateTemplates();
  }

  return NextResponse.json(result);
}
