import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TemplateSubmissionForm from "@/components/dashboard/TemplateSubmissionForm";

export const metadata: Metadata = {
  title: "Edit Template Submission | The Academic Curator",
};

export default async function EditTemplateSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const [categories, submission] = await Promise.all([
    prisma.templateCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
      },
    }),
    prisma.templateSubmission.findFirst({
      where: {
        id,
        userId: session.user.id,
        status: { in: ["DRAFT", "REJECTED"] },
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
          orderBy: {
            category: {
              sortOrder: "asc",
            },
          },
        },
      },
    }),
  ]);

  if (!submission) {
    redirect("/dashboard/templates");
  }

  return (
    <TemplateSubmissionForm
      categories={categories}
      submission={{
        ...submission,
        categories: submission.categories.map((item) => item.category),
      }}
    />
  );
}
