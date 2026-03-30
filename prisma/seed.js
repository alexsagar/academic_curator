/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, TemplateSubmissionStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_TEMPLATE_CATEGORIES = [
  {
    slug: "it-professionals",
    name: "IT Professionals",
    description: "Templates for engineers, developers, analysts, and technical specialists.",
    icon: "code",
    sortOrder: 10,
  },
  {
    slug: "musicians",
    name: "Musicians",
    description: "Showcase performances, recordings, collaborations, and creative direction.",
    icon: "music_note",
    sortOrder: 20,
  },
  {
    slug: "artists",
    name: "Artists",
    description: "Portfolio layouts for visual artists, designers, and multidisciplinary studios.",
    icon: "palette",
    sortOrder: 30,
  },
  {
    slug: "researchers",
    name: "Researchers",
    description: "Highlight publications, grants, methods, and academic impact.",
    icon: "biotech",
    sortOrder: 40,
  },
  {
    slug: "students",
    name: "Students",
    description: "Launch a first professional portfolio with coursework, capstones, and achievements.",
    icon: "school",
    sortOrder: 50,
  },
  {
    slug: "educators",
    name: "Educators",
    description: "Present teaching philosophy, curriculum work, outcomes, and leadership.",
    icon: "menu_book",
    sortOrder: 60,
  },
  {
    slug: "entrepreneurs",
    name: "Entrepreneurs",
    description: "Pitch ventures, traction, strategy, and product storytelling in one place.",
    icon: "rocket_launch",
    sortOrder: 70,
  },
  {
    slug: "freelancers",
    name: "Freelancers",
    description: "Demonstrate client work, service positioning, testimonials, and delivery style.",
    icon: "work",
    sortOrder: 80,
  },
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  for (const category of DEFAULT_TEMPLATE_CATEGORIES) {
    await prisma.templateCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
  }

  const categories = await prisma.templateCategory.findMany({
    select: { id: true, slug: true },
  });

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const fallbackCategoryId = categoryBySlug.get("students");

  const templates = await prisma.template.findMany({
    where: { approvalStatus: TemplateSubmissionStatus.APPROVED },
    select: {
      id: true,
      category: true,
      categoryLinks: {
        select: { categoryId: true },
      },
    },
  });

  for (const template of templates) {
    if (template.categoryLinks.length > 0) {
      continue;
    }

    const inferredSlug = slugify(template.category);
    const categoryId = categoryBySlug.get(inferredSlug) || fallbackCategoryId;

    if (!categoryId) {
      continue;
    }

    await prisma.templateCategoryOnTemplate.create({
      data: {
        templateId: template.id,
        categoryId,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
