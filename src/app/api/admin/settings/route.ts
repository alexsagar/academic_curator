import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const ALLOWED_SETTINGS_KEYS = new Set([
  "allowRegistration",
  "requireEmailVerification",
  "autoApprovePortfolios",
  "maintenanceMode",
  "maxFreePortfolios",
  "defaultLanguage",
  "supportEmail",
]);

export async function GET() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.platformSettings.findMany();
  
  // Convert array of {key, value} to single object
  const settingsObj: Record<string, Prisma.JsonValue> = {};
  settings.forEach((s) => {
    settingsObj[s.key] = s.value;
  });

  return NextResponse.json(settingsObj);
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newSettings = (await request.json()) as Record<string, Prisma.JsonValue>;
  const entries = Object.entries(newSettings).filter(([key]) =>
    ALLOWED_SETTINGS_KEYS.has(key)
  );

  await prisma.$transaction(
    entries.map(([key, value]) => {
      const prismaValue =
        value === null ? PrismaNamespace.JsonNull : (value as Prisma.InputJsonValue);

      return prisma.platformSettings.upsert({
        where: { key },
        update: { value: prismaValue },
        create: { key, value: prismaValue },
      });
    })
  );

  return NextResponse.json({ message: "Settings updated successfully" });
}
