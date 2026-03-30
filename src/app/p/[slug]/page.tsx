import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import LivePreview from "@/components/builder/LivePreview";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: { slug, isPublished: true },
    include: { user: true }
  });

  if (!portfolio) {
    return { title: "Portfolio Not Found" };
  }

  const title = portfolio.title || `${portfolio.user.name}'s Portfolio`;
  
  return {
    title,
    description: "An academic portfolio curated on The Academic Curator.",
  };
}

export default async function PublicPortfolioPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // Find the published portfolio by slug using unstable_cache
  const getCachedPortfolio = unstable_cache(
    async (s: string) => {
      return await prisma.portfolio.findFirst({
        where: { slug: s, isPublished: true },
        include: { template: true },
      });
    },
    [`portfolio-page-${slug}`],
    { tags: [CACHE_TAGS.portfolio(slug)], revalidate: 3600 }
  );

  const portfolio = await getCachedPortfolio(slug);

  if (!portfolio) {
    notFound();
  }

  // We reuse the LivePreview component for the actual public view, but force it to desktop/full width
  // In a real scenario, this would dynamically render semantic HTML based on the template logic.
  
  return (
    <div className="min-h-screen bg-surface w-full">
      <LivePreview 
        template={portfolio.template} 
        customizations={portfolio.customizations} 
        device="desktop" 
      />
    </div>
  );
}
