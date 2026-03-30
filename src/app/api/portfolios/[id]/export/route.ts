import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import JSZip from "jszip";
import { escapeHtml, getPreviewModel } from "@/lib/portfolio";

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
    where: { id, userId: session.user.id },
    include: { template: true }
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  // Generate ZIP Content
  const zip = new JSZip();

  const preview = getPreviewModel(portfolio.customizations);
  const primaryColor = preview.styles.primaryColor;
  const surfaceColor = preview.styles.surfaceColor;
  const textColor = preview.styles.textColor;
  const fontFamily = preview.styles.fontFamily;

  const name = escapeHtml(preview.content.name || "Academic Profile");
  const title = escapeHtml(preview.content.title);
  const bio = escapeHtml(preview.content.bio);

  // 1. Setup HTML
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - ${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <div class="hero-content">
      <h1>${name}</h1>
      <h2>${title}</h2>
      <p>${bio}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // 2. Setup CSS
  const styleCss = `
:root {
  --primary: ${primaryColor};
  --surface: ${surfaceColor};
  --text: ${textColor};
  --font-family: ${fontFamily};
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--surface);
  color: var(--text);
  font-family: var(--font-family);
  line-height: 1.6;
}

.hero {
  padding: 100px 20px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.hero h2 {
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 2rem;
  font-weight: normal;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.8;
}
  `.trim();

  // Add files to zip
  zip.file("index.html", indexHtml);
  zip.file("style.css", styleCss);
  
  // Create readme
  zip.file("README.md", `# ${name} - Portfolio Setup\n\nThis portfolio was exported from The Academic Curator.\nTo view your portfolio, extract all files and open \`index.html\` in your web browser.`);

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  // Return the zip file securely
  const response = new NextResponse(buffer as unknown as BodyInit);
  response.headers.set("Content-Type", "application/zip");
  response.headers.set("Content-Disposition", `attachment; filename="${portfolio.slug}-export.zip"`);
  
  return response;
}
