import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getActiveSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "My Templates | The Academic Curator",
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-container-high text-on-surface",
  SUBMITTED: "bg-primary/10 text-primary",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-error/10 text-error",
};

export default async function DashboardTemplatesPage() {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const submissions = await prisma.templateSubmission.findMany({
    where: { userId: session.user.id },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      categories: {
        select: {
          category: {
            select: {
              id: true,
              slug: true,
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
      publishedTemplate: {
        select: {
          id: true,
          slug: true,
          isActive: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            Template Submissions
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Create and manage marketplace templates for different professional categories.
          </p>
        </div>

        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
        >
          <Icon name="add" className="text-base" />
          New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
          <Icon name="dashboard_customize" className="mx-auto mb-4 text-5xl text-outline" />
          <h2 className="text-2xl font-headline font-bold text-on-surface">No submissions yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant">
            Start a new creator submission to publish templates for students, researchers, artists,
            and other professional audiences.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {submissions.map((submission) => (
            <article
              key={submission.id}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                        statusStyles[submission.status] ?? statusStyles.DRAFT
                      }`}
                    >
                      {submission.status}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Updated {submission.updatedAt.toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-headline font-bold text-on-surface">
                      {submission.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">
                      {submission.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {submission.categories.map(({ category }) => (
                      <span
                        key={category.id}
                        className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  {submission.adminReviewNotes ? (
                    <div className="rounded-xl border border-error/10 bg-error/5 px-4 py-3 text-sm text-on-surface">
                      <div className="mb-1 font-bold uppercase tracking-widest text-error">Admin Notes</div>
                      <p className="text-on-surface-variant">{submission.adminReviewNotes}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 lg:min-w-[220px]">
                  {(submission.status === "DRAFT" || submission.status === "REJECTED") && (
                    <Link
                      href={`/dashboard/templates/${submission.id}/edit`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container-high px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-container-highest"
                    >
                      <Icon name="edit" className="text-base" />
                      Edit Submission
                    </Link>
                  )}
                  {submission.publishedTemplate ? (
                    <Link
                      href={`/templates?category=${encodeURIComponent(submission.categories[0]?.category.slug ?? "")}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface transition hover:bg-surface-container-high"
                    >
                      <Icon name="visibility" className="text-base" />
                      View Live Category
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
