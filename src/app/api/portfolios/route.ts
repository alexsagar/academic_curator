import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth";
import {
  DEFAULT_CUSTOMIZATIONS,
  createPortfolioWithUniqueSlug,
  toPortfolioJsonValue,
} from "@/lib/portfolio";
import { validateOptionalDisplayName } from "@/lib/validation";

export async function GET() {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    include: { template: { select: { name: true, category: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(portfolios);
}

export async function POST(request: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, templateId } = body as { title?: unknown; templateId?: unknown };

  if (typeof templateId !== "string" || !templateId.trim()) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  const normalizedTitle = validateOptionalDisplayName(title);
  if (!normalizedTitle.success || !normalizedTitle.data) {
    return NextResponse.json({ error: "Title and templateId are required" }, { status: 400 });
  }
  const portfolioTitle = normalizedTitle.data;

  const template = await prisma.template.findFirst({
    where: { id: templateId, isActive: true, approvalStatus: "APPROVED" },
    select: { id: true, name: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const portfolio = await prisma.$transaction(async (tx) => {
    const createdPortfolio = await createPortfolioWithUniqueSlug(tx, {
      title: portfolioTitle,
      userId: session.user.id,
      templateId: template.id,
      customizations: toPortfolioJsonValue(DEFAULT_CUSTOMIZATIONS),
      progress: 0,
      status: "DRAFT",
    });

    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        action: "portfolio_created",
        metadata: { portfolioId: createdPortfolio.id, templateId: template.id },
      },
    });

    return createdPortfolio;
  });

  return NextResponse.json(portfolio, { status: 201 });
}
