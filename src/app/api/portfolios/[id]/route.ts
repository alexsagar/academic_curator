import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth";
import { sanitizePortfolioCustomizations, toPortfolioJsonValue } from "@/lib/portfolio";
import { validateOptionalDisplayName } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: session.user.id },
    include: { template: true, versions: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  return NextResponse.json(portfolio);
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
  const body = await request.json();
  const { title, customizations, progress } = body;

  const existing = await prisma.portfolio.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const sanitizedCustomizations =
    customizations !== undefined ? sanitizePortfolioCustomizations(customizations) : undefined;
  const normalizedTitle =
    title !== undefined ? validateOptionalDisplayName(title) : null;

  if (normalizedTitle && !normalizedTitle.success) {
    return NextResponse.json({ error: normalizedTitle.error }, { status: 400 });
  }

  const normalizedProgress =
    progress === undefined
      ? undefined
      : Math.min(100, Math.max(0, Math.trunc(Number(progress) || 0)));

  const portfolio = await prisma.portfolio.update({
    where: { id },
    data: {
      ...(normalizedTitle?.success && normalizedTitle.data ? { title: normalizedTitle.data } : {}),
      ...(sanitizedCustomizations && { customizations: toPortfolioJsonValue(sanitizedCustomizations) }),
      ...(normalizedProgress !== undefined && { progress: normalizedProgress }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(portfolio);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.portfolio.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  await prisma.portfolio.delete({ where: { id } });

  return NextResponse.json({ message: "Portfolio deleted" });
}
