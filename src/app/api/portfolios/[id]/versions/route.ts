import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    where: { id, userId: session.user.id }
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const versions = await prisma.portfolioVersion.findMany({
    where: { portfolioId: id },
    orderBy: { versionNumber: "desc" },
    select: { id: true, versionNumber: true, changeSummary: true, createdAt: true }
  });

  return NextResponse.json(versions);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: session.user.id }
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const body = await request.json();
  const summary = body.summary || "Manual Snapshot";

  let newVersion = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      newVersion = await prisma.$transaction(async (tx) => {
        const latestVersion = await tx.portfolioVersion.findFirst({
          where: { portfolioId: id },
          orderBy: { versionNumber: "desc" },
          select: { versionNumber: true },
        });

        const nextNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        return tx.portfolioVersion.create({
          data: {
            portfolioId: id,
            versionNumber: nextNumber,
            customizations: portfolio.customizations || {},
            changeSummary: summary,
          },
        });
      });
      break;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  if (!newVersion) {
    return NextResponse.json({ error: "Unable to create version snapshot" }, { status: 409 });
  }

  return NextResponse.json(newVersion);
}
