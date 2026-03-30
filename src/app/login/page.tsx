"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-grow items-center justify-center px-6 py-32">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="text-center">
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">Welcome Back</h1>
            <p className="text-on-surface-variant">Resume your journey as a digital curator.</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-8 ghost-border shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="rounded-md bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-label font-medium uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-label font-medium uppercase tracking-wider text-on-surface-variant">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-primary transition-colors hover:text-primary-container">
                    Forgot Password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-md border-none bg-surface-container-highest px-4 py-3 text-on-surface outline-none transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 font-label font-bold text-white signature-cta shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
                <Icon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="mx-4 flex-shrink text-xs font-medium uppercase tracking-widest text-on-surface-variant">or</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-surface-container-low px-6 py-3 font-label font-semibold text-on-surface transition-all hover:bg-surface-container-high"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-on-surface-variant">
            New to the platform?{" "}
            <Link href="/signup" className="ml-1 font-bold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
