import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" },
    include: {
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
    }
  });

  return NextResponse.json(
    templates.map((template) => ({
      ...template,
      categories: template.categoryLinks.map((item) => item.category),
    }))
  );
}
