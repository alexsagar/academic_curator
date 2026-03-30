import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { validateRegistrationInput } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!rateLimit(`${ip}:register`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many registrations from this IP, please try again after 15 minutes" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = validateRegistrationInput(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      await tx.subscription.create({
        data: {
          userId: createdUser.id,
          tier: "FREE",
          status: "ACTIVE",
        },
      });

      await tx.activityLog.create({
        data: {
          userId: createdUser.id,
          action: "user_registered",
          metadata: { method: "credentials" },
        },
      });

      return createdUser;
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    logger.error("Registration error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
