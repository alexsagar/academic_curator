import { NextResponse } from "next/server";
import type { Prisma, Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { clampInteger } from "@/lib/validation";

const ALLOWED_ROLES: Role[] = ["USER", "MODERATOR", "ADMIN"];

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const page = clampInteger(searchParams.get("page"), 1, 1, 10_000);
  const pageSize = clampInteger(searchParams.get("pageSize"), 25, 1, 100);

  const where: Prisma.UserWhereInput = {
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } }
      ]
    } : {}),
    ...(ALLOWED_ROLES.includes(role as Role) ? { role: role as Role } : {})
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { portfolios: true } },
      },
    }),
  ]);

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      portfolioCount: user._count.portfolios,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
