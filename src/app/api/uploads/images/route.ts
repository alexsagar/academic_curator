import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identity = session.user.id;
  if (!rateLimit(`${identity}:upload`, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: "Upload limit exceeded (10 per minute)" },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const kind = formData.get("kind");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!ALLOWED_CONTENT_TYPES.has(image.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are supported" },
      { status: 400 }
    );
  }

  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller" },
      { status: 400 }
    );
  }

  const safeKind = kind === "banner" ? "banner" : "avatar";

  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const transformed = await sharp(imageBuffer)
    .rotate()
    .resize({
      width: safeKind === "avatar" ? 1200 : 2000,
      height: safeKind === "avatar" ? 1200 : 1200,
      fit: safeKind === "avatar" ? "cover" : "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${Date.now()}-${randomUUID()}.webp`;
  const key = `${session.user.id}/${safeKind}/${filename}`;

  const storage = getStorage();
  const url = await storage.upload(key, transformed, "image/webp");

  return NextResponse.json({ url });
}
