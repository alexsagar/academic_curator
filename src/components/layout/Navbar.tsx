"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import Icon from "@/components/ui/Icon";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/15 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tighter text-slate-900 font-headline"
        >
          The Academic Curator
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href.replace("/#", "/")));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-headline font-semibold tracking-tight transition-colors ${
                  isActive
                    ? "text-sky-600 font-bold border-b-2 border-sky-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          <Link
            href="/login"
            className="hidden md:block px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-slate-50 rounded-lg transition-all"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 signature-cta text-white font-label text-sm font-bold tracking-widest uppercase rounded-md shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Sign Up
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
            type="button"
          >
            <Icon name={mobileOpen ? "close" : "menu"} className="text-2xl text-slate-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pb-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-slate-700 font-headline font-semibold hover:text-primary transition-colors border-b border-slate-100/50"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/login"
              className="text-center py-3 text-sky-700 font-semibold rounded-md hover:bg-slate-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="text-center py-3 signature-cta text-white font-bold rounded-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
