import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const usersCount = await prisma.user.count();
  const portfoliosCount = await prisma.portfolio.count();
  const templatesCount = await prisma.template.count();
  const activeSubs = await prisma.subscription.count({ where: { status: "ACTIVE" } });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true, role: true }
  });

  return (
    <div>
      <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-8">
        Platform Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Users", value: usersCount, icon: "group", color: "text-primary" },
          { label: "Portfolios Created", value: portfoliosCount, icon: "web", color: "text-tertiary-container" },
          { label: "Active Subscriptions", value: activeSubs, icon: "star", color: "text-emerald-500" },
          { label: "Templates", value: templatesCount, icon: "palette", color: "text-secondary" },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-headline font-bold text-on-surface">{stat.value}</p>
            </div>
            <div className={`p-2 bg-surface-container-low rounded-lg ${stat.color}`}>
              <Icon name={stat.icon} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-bold">Recent Users</h3>
            <a href="/admin/users" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All</a>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {recentUsers.map((user: { id: string; name: string | null; email: string; createdAt: Date; role: Role }) => (
              <div key={user.id} className="p-4 px-6 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.name?.[0] || user.email?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-on-surface">{user.name || "Unknown"}</p>
                    <p className="text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-error/10 text-error' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6">
          <h3 className="font-headline font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/templates" className="p-4 bg-surface-container-low rounded-lg text-center hover:bg-surface-container-high transition-colors group">
              <Icon name="add_photo_alternate" className="mb-2 text-4xl text-primary transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold">Upload Template</p>
            </a>
            <a href="/admin/users" className="p-4 bg-surface-container-low rounded-lg text-center hover:bg-surface-container-high transition-colors group">
              <Icon name="person_search" className="mb-2 text-4xl text-secondary transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold">Find User</p>
            </a>
            <a href="/admin/moderation" className="p-4 bg-surface-container-low rounded-lg text-center hover:bg-surface-container-high transition-colors group">
              <Icon name="report" className="mb-2 text-4xl text-error transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold">Review Reports</p>
            </a>
            <a href="/admin/settings" className="p-4 bg-surface-container-low rounded-lg text-center hover:bg-surface-container-high transition-colors group">
              <Icon name="tune" className="mb-2 text-4xl text-on-surface-variant transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold">Platform Settings</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
