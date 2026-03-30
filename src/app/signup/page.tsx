"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative hidden items-center justify-center overflow-hidden bg-surface-container p-20 lg:flex lg:w-1/2">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-br from-primary/5 to-primary-container/10"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-container via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="mb-6 font-headline text-5xl font-extrabold leading-tight tracking-tighter text-on-surface">
            Elevate your <span className="text-primary">academic journey</span> to a professional gallery.
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-on-surface-variant">
            The Academic Curator helps students transform their projects into high-end digital experiences that demand
            attention.
          </p>
          <div className="flex gap-4">
            <div className="h-1 w-12 rounded-full bg-primary"></div>
            <div className="h-1 w-4 rounded-full bg-outline-variant/30"></div>
            <div className="h-1 w-4 rounded-full bg-outline-variant/30"></div>
          </div>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center bg-surface px-6 py-12 md:px-12 lg:px-24">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link href="/" className="font-headline text-2xl font-extrabold tracking-tighter text-slate-900">
              The Academic Curator
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="mb-2 font-headline text-3xl font-bold tracking-tight text-on-surface">Create your account</h2>
            <p className="text-on-surface-variant">Join the community of student curators.</p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group mb-6 flex w-full items-center justify-center gap-3 rounded-md bg-surface-container-lowest px-4 py-3 ghost-border transition-all duration-200 hover:bg-surface-container-high"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-on-surface">Continue with Google</span>
          </button>

          <div className="relative mb-6 flex items-center">
            <div className="flex-grow border-t border-outline-variant/20"></div>
            <span className="mx-4 flex-shrink text-xs font-label uppercase tracking-widest text-outline">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-outline-variant/20"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-md bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first-name" className="block text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Jane"
                  required
                  className="w-full rounded-sm border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last-name" className="block text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                  Last Name
                </label>
                <input
                  id="last-name"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                  required
                  className="w-full rounded-sm border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane.doe@university.edu"
                required
                className="w-full rounded-sm border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-label font-semibold uppercase tracking-wider text-on-surface-variant">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full rounded-sm border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md py-4 text-sm font-bold uppercase tracking-widest text-white signature-cta shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
            <p className="px-4 text-[11px] leading-relaxed text-outline">
              By signing up, you agree to our{" "}
              <a href="#" className="underline hover:text-on-surface">Terms of Service</a> and{" "}
              <a href="#" className="underline hover:text-on-surface">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <footer className="mt-auto w-full max-w-md pt-12">
          <div className="flex justify-center gap-6">
            <a href="#" className="text-xs text-outline transition-colors hover:text-primary">Help Center</a>
            <a href="#" className="text-xs text-outline transition-colors hover:text-primary">Privacy</a>
            <a href="#" className="text-xs text-outline transition-colors hover:text-primary">Terms</a>
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-tighter text-outline/50">
            {"©"} {new Date().getFullYear()} The Academic Curator. All rights reserved.
          </p>
        </footer>
      </section>
    </main>
  );
}
