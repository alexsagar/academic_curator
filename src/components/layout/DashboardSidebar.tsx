"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Icon from "@/components/ui/Icon";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Create New", href: "/dashboard/portfolio/new", icon: "add_circle" },
  { label: "My Templates", href: "/dashboard/templates", icon: "dashboard_customize" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-surface-container-low min-h-screen p-6 border-r border-outline-variant/10">
      {/* Logo */}
      <Link href="/" className="font-headline text-xl font-extrabold tracking-tighter text-on-surface mb-12">
        The Academic Curator
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={link.icon} className="text-xl" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all"
      >
        <Icon name="logout" className="text-xl" />
        Log Out
      </button>
    </aside>
  );
}
