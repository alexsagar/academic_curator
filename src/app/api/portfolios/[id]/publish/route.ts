import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensurePortfolioSlug } from "@/lib/portfolio";
import { revalidatePortfolio } from "@/lib/cache";

export async function POST(
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

  const isPublished = !existing.isPublished;
  const portfolio = await prisma.$transaction(async (tx) => {
    const slug = existing.slug || (await ensurePortfolioSlug(tx, existing.id, existing.title));

    const updatedPortfolio = await tx.portfolio.update({
      where: { id },
      data: {
        isPublished,
        slug,
        publishedUrl: isPublished ? `/p/${slug}` : null,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        updatedAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        action: isPublished ? "portfolio_published" : "portfolio_unpublished",
        metadata: { portfolioId: updatedPortfolio.id },
      },
    });

    return updatedPortfolio;
  });

  // Invalidate the public portfolio page cache
  if (portfolio.slug) {
    revalidatePortfolio(portfolio.slug);
  }

  return NextResponse.json(portfolio);
}
