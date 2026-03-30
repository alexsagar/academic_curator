"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Icon from "@/components/ui/Icon";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: "monitoring" },
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Templates", href: "/admin/templates", icon: "dashboard_customize" },
  { label: "Moderation", href: "/admin/moderation", icon: "gavel" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="font-headline text-lg font-extrabold tracking-tighter text-primary">
          AC <span className="text-on-surface">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Icon name={link.icon} className="text-[20px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-error hover:bg-error-container/50 transition-colors"
        >
          <Icon name="logout" className="text-[20px]" />
          Exit Admin
        </button>
      </div>
    </aside>
  );
}
