import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth";
import { validateOptionalDisplayName } from "@/lib/validation";

export async function GET() {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, bio: true, image: true, language: true },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, bio, language } = body as {
    name?: unknown;
    bio?: unknown;
    language?: unknown;
  };

  const normalizedName = name !== undefined ? validateOptionalDisplayName(name) : null;
  if (normalizedName && !normalizedName.success) {
    return NextResponse.json({ error: normalizedName.error }, { status: 400 });
  }

  const normalizedBio =
    bio === undefined
      ? undefined
      : typeof bio === "string"
        ? bio.trim().slice(0, 2000)
        : null;

  if (bio !== undefined && normalizedBio === null) {
    return NextResponse.json({ error: "Bio must be a string" }, { status: 400 });
  }

  const normalizedLanguage =
    language === undefined
      ? undefined
      : typeof language === "string" && /^[a-z]{2}$/i.test(language.trim())
        ? language.trim().toLowerCase()
        : null;

  if (language !== undefined && normalizedLanguage === null) {
    return NextResponse.json({ error: "Language must be a 2-letter code" }, { status: 400 });
  }

  const dataToUpdate: {
    name?: string | null;
    bio?: string | null;
    language?: string;
  } = {};

  if (normalizedName?.success) {
    dataToUpdate.name = normalizedName.data;
  }

  if (normalizedBio !== undefined) {
    dataToUpdate.bio = normalizedBio;
  }

  if (normalizedLanguage !== undefined && normalizedLanguage !== null) {
    dataToUpdate.language = normalizedLanguage;
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: dataToUpdate,
    select: { id: true, name: true, email: true, bio: true, image: true, language: true },
  });

  return NextResponse.json(user);
}
