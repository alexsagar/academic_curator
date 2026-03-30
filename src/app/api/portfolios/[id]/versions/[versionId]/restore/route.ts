import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sanitizePortfolioCustomizations, toPortfolioJsonValue } from "@/lib/portfolio";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string, versionId: string }> }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, versionId } = await params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: session.user.id }
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const version = await prisma.portfolioVersion.findFirst({
    where: { id: versionId, portfolioId: id }
  });

  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const updatedPortfolio = await prisma.portfolio.update({
    where: { id },
    data: { customizations: toPortfolioJsonValue(sanitizePortfolioCustomizations(version.customizations)) },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "portfolio_restored",
      metadata: { portfolioId: id, versionNumber: version.versionNumber },
    }
  });

  return NextResponse.json(updatedPortfolio);
}
