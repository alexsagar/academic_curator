import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { revalidateTemplates } from "@/lib/cache";

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

  return NextResponse.json(template);
}

