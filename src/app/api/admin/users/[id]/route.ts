import { NextResponse } from "next/server";
import type { Prisma, Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own status" }, { status: 400 });
  }

  const body = (await request.json()) as { isActive?: boolean; role?: Role };
  const { isActive, role } = body;

  const dataToUpdate: Prisma.UserUpdateInput = {};
  if (isActive !== undefined) dataToUpdate.isActive = isActive;
  if (role !== undefined) dataToUpdate.role = role;

  const user = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  return NextResponse.json(user);
}
