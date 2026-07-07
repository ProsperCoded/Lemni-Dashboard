"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { authApi, setTokens, ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      setTokens(response.accessToken, response.refreshToken, response.merchant);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Header bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-card-border">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Back Home
          </span>
        </Link>
      </header>

      {/* Main card section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-xl shadow-lg p-8">
          {/* Logo element */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="flex items-center gap-2">
              <span
                className="text-3xl font-extrabold select-none"
                style={{ color: "#2DCA73" }}
              >
                ∞
              </span>
              <span className="font-cursive text-3xl font-bold tracking-wide">
                Lemni
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-2">
              Merchant Login
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-xs font-semibold text-rose-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Merchant Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Continue"
              )}
            </button>
          </form>

          {/* Setup callout */}
          <div className="mt-8 text-center text-xs text-muted border-t border-card-border pt-6">
            New to Lemni?{" "}
            <Link
              href="/signup"
              className="font-semibold text-accent hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
