import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { revalidateTemplates } from "@/lib/cache";

const adminTemplateInclude = {
  portfolios: { select: { id: true } },
  creator: { select: { id: true, name: true, email: true } },
  categoryLinks: {
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
} satisfies Prisma.TemplateInclude;

type AdminTemplatePayload = Prisma.TemplateGetPayload<{
  include: typeof adminTemplateInclude;
}>;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { isActive, isPremium } = body;

  const dataToUpdate: Prisma.TemplateUpdateInput = {};
  if (isActive !== undefined) dataToUpdate.isActive = isActive;
  if (isPremium !== undefined) dataToUpdate.isPremium = isPremium;

  const template = await prisma.template.update({
    where: { id },
    data: dataToUpdate,
  });

  revalidateTemplates();

  const updatedTemplate = await prisma.template.findUnique({
    where: { id: template.id },
    include: adminTemplateInclude,
  });

  return NextResponse.json(
    updatedTemplate
      ? {
          ...updatedTemplate,
          categories: (updatedTemplate as AdminTemplatePayload).categoryLinks.map(
            (item: AdminTemplatePayload["categoryLinks"][number]) => item.category
          ),
        }
      : null
  );
}
