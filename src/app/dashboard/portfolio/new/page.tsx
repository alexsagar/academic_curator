import Link from "next/link";
import prisma from "@/lib/prisma";
import { getActiveSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CreatePortfolioButton from "@/components/dashboard/CreatePortfolioButton";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Choose Template | The Academic Curator",
};

export default async function NewPortfolioPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login");

  const templates = await prisma.template.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      isPremium: true,
      thumbnail: true,
      categoryLinks: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          category: {
            sortOrder: "asc",
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-12">
        <Link href="/dashboard" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 mb-6">
          <Icon name="arrow_back" className="text-lg" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
          Choose a Template
        </h1>
        <p className="text-on-surface-variant">
          Select a template to start building your portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((t) => (
          <div key={t.id} className="group bg-surface-container-lowest rounded-xl overflow-hidden ghost-border hover:shadow-xl transition-all duration-300">
            <div className="aspect-video bg-surface-container-low">
              <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <Icon name="web" className="text-5xl text-on-surface-variant/20" />
              </div>
            </div>
            <div className="p-6">
              <div className="mb-2 flex flex-wrap gap-2">
                {(t.categoryLinks.length > 0
                  ? t.categoryLinks.map((item) => item.category.name)
                  : [t.category]
                ).map((name) => (
                  <span
                    key={name}
                    className="text-[10px] font-bold tracking-widest uppercase text-primary"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-headline font-bold mb-2">{t.name}</h3>
              <p className="text-on-surface-variant text-sm mb-4">{t.description}</p>
              {t.isPremium && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-4">
                  Premium Template
                </p>
              )}
              <CreatePortfolioButton
                templateId={t.id}
                defaultTitle={`${t.name} Portfolio`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
