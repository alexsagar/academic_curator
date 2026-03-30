import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TemplateSubmissionForm from "@/components/dashboard/TemplateSubmissionForm";

export const metadata: Metadata = {
  title: "New Template Submission | The Academic Curator",
};

export default async function NewTemplateSubmissionPage() {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const categories = await prisma.templateCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
    },
  });

  return <TemplateSubmissionForm categories={categories} />;
}
