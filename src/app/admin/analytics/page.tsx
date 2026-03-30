import prisma from "@/lib/prisma";

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [users, portfolios, templates, publishedLogs] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.portfolio.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true, template: { select: { category: true } } },
    }),
    prisma.template.findMany({
      where: { portfolios: { some: {} } },
      select: { category: true, portfolios: { select: { id: true } } },
    }),
    prisma.activityLog.findMany({
      where: {
        createdAt: { gte: weekStart },
        action: { in: ["portfolio_published"] },
      },
      select: { createdAt: true },
    }),
  ]);

  const monthBuckets = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: getMonthLabel(date),
      users: 0,
    };
  });

  for (const user of users) {
    const date = new Date(user.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthBuckets.find((item) => item.key === key);
    if (bucket) {
      bucket.users += 1;
    }
  }

  const categoryMap = new Map<string, number>();
  for (const template of templates) {
    categoryMap.set(template.category, (categoryMap.get(template.category) ?? 0) + template.portfolios.length);
  }

  const weekBuckets = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + offset);
    return {
      key: date.toDateString(),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      created: 0,
      published: 0,
    };
  });

  for (const portfolio of portfolios) {
    const key = new Date(portfolio.createdAt).toDateString();
    const bucket = weekBuckets.find((item) => item.key === key);
    if (bucket) {
      bucket.created += 1;
    }
  }

  for (const log of publishedLogs) {
    const key = new Date(log.createdAt).toDateString();
    const bucket = weekBuckets.find((item) => item.key === key);
    if (bucket) {
      bucket.published += 1;
    }
  }

  const templatePopularity = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
          Platform Analytics
        </h1>
        <p className="text-on-surface-variant text-sm">
          Live platform metrics from users, templates, and portfolio activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm lg:col-span-2">
          <h3 className="font-headline font-bold text-on-surface mb-6">User Growth (Last 6 Months)</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {monthBuckets.map((month) => (
              <div key={month.key} className="bg-surface-container-low rounded-lg p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">{month.name}</p>
                <p className="text-2xl font-headline font-bold text-on-surface">{month.users}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-6">Template Popularity</h3>
          <div className="space-y-3">
            {templatePopularity.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No portfolio usage data yet.</p>
            ) : (
              templatePopularity.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-surface-container-low rounded-lg px-4 py-3">
                  <span className="text-sm font-medium text-on-surface">{item.name}</span>
                  <span className="text-sm font-bold text-primary">{item.value}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm lg:col-span-3">
          <h3 className="font-headline font-bold text-on-surface mb-6">Weekly Portfolio Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekBuckets.map((day) => (
              <div key={day.key} className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3">{day.day}</p>
                <p className="text-sm text-on-surface">Created: <span className="font-bold">{day.created}</span></p>
                <p className="text-sm text-on-surface">Published: <span className="font-bold">{day.published}</span></p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
