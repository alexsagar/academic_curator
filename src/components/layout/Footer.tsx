import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 px-6 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
        <div className="col-span-1">
          <div className="mb-4 font-headline text-xl font-bold text-slate-900">
            The Academic Curator
          </div>
          <p className="mb-6 font-body text-sm leading-relaxed text-slate-500">
            Defining the next generation of professional academic presentation.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-slate-400 transition-colors hover:text-sky-600" aria-label="Website">
              <Icon name="language" />
            </a>
            <a href="#" className="text-slate-400 transition-colors hover:text-sky-600" aria-label="Email">
              <Icon name="alternate_email" />
            </a>
            <a href="#" className="text-slate-400 transition-colors hover:text-sky-600" aria-label="Profile">
              <Icon name="person_outline" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-widest text-slate-900">
            Product
          </h4>
          <ul className="space-y-4">
            <li>
              <Link href="/#how-it-works" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/templates" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                Templates
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-widest text-slate-900">
            Company
          </h4>
          <ul className="space-y-4">
            <li>
              <Link href="/about" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                About
              </Link>
            </li>
            <li>
              <a href="#" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-headline text-sm font-bold uppercase tracking-widest text-slate-900">
            Legal
          </h4>
          <ul className="space-y-4">
            <li>
              <a href="#" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="font-body text-sm text-slate-500 transition-colors hover:text-sky-600 hover:underline decoration-sky-500/30 underline-offset-4">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
        <p className="font-body text-sm text-slate-500 opacity-80">
          {"©"} {new Date().getFullYear()} The Academic Curator. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
          <span className="text-xs font-medium text-slate-400">All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
