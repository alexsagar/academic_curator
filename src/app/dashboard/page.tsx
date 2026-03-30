import Link from "next/link";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";
import Icon from "@/components/ui/Icon";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login");

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      progress: true,
      isPublished: true,
      updatedAt: true,
      template: { select: { name: true, category: true } },
    },
  });

  const stats = {
    total: portfolios.length,
    published: portfolios.filter((portfolio) => portfolio.isPublished).length,
    inProgress: portfolios.filter((portfolio) => portfolio.progress > 0 && portfolio.progress < 100).length,
    averageProgress:
      portfolios.length > 0
        ? Math.round(portfolios.reduce((sum, portfolio) => sum + portfolio.progress, 0) / portfolios.length)
        : 0,
  };

  return (
    <div>
      <OnboardingWizard />
      <div className="tour-step-3 mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            Welcome back{session.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-on-surface-variant">Manage your portfolios and track your progress.</p>
        </div>
        <Link
          href="/dashboard/portfolio/new"
          className="tour-step-2 flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wider text-white signature-cta shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Icon name="add" className="text-xl" />
          New Portfolio
        </Link>
      </div>

      <div className="tour-step-1 mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Portfolios", value: String(stats.total), icon: "folder", color: "bg-primary" },
          { label: "Published", value: String(stats.published), icon: "public", color: "bg-emerald-500" },
          { label: "In Progress", value: String(stats.inProgress), icon: "edit_note", color: "bg-tertiary-container" },
          { label: "Avg. Progress", value: `${stats.averageProgress}%`, icon: "trending_up", color: "bg-secondary" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface-container-lowest p-6 ghost-border transition-all hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon name={stat.icon} className="text-xl text-white" />
              </div>
            </div>
            <p className="mb-1 text-3xl font-headline font-extrabold text-on-surface">{stat.value}</p>
            <p className="text-sm text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-headline font-bold text-on-surface">Your Portfolios</h2>
      </div>

      {portfolios.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-16 text-center ghost-border">
          <Icon name="folder_open" className="mb-6 text-6xl text-on-surface-variant/30" />
          <h3 className="mb-3 text-xl font-headline font-bold text-on-surface">No portfolios yet</h3>
          <p className="mx-auto mb-8 max-w-md text-on-surface-variant">
            Start building your professional academic presence. Choose a template and customize it to showcase your
            work.
          </p>
          <Link
            href="/dashboard/portfolio/new"
            className="inline-flex items-center gap-2 rounded-md px-8 py-4 text-white signature-cta font-label font-bold uppercase tracking-wider shadow-xl shadow-primary/25 transition-all hover:opacity-90"
          >
            <Icon name="add" />
            Create Your First Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {portfolios.map((portfolio) => (
            <Link
              key={portfolio.id}
              href={`/dashboard/portfolio/${portfolio.id}/edit`}
              className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 ghost-border transition-all hover:shadow-lg md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="mb-1 text-lg font-headline font-bold text-on-surface">{portfolio.title}</h3>
                <p className="text-sm text-on-surface-variant">
                  {portfolio.template.name} {"·"} {portfolio.template.category}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                <span>{portfolio.progress}% complete</span>
                <span>{portfolio.isPublished ? "Published" : portfolio.status.replace(/_/g, " ")}</span>
                <span>{new Date(portfolio.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
