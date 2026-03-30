import { NextResponse } from "next/server";
import { TemplateSubmissionStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function normalizeStatus(value: string | null): TemplateSubmissionStatus | undefined {
  if (value === "DRAFT" || value === "SUBMITTED" || value === "APPROVED" || value === "REJECTED") {
    return value;
  }

  return undefined;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = normalizeStatus(searchParams.get("status"));

  const submissions = await prisma.templateSubmission.findMany({
    where: status ? { status } : undefined,
    orderBy: [
      { status: "asc" },
      { submittedAt: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
