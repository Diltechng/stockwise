"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const email = formData.get("email");
      const password = formData.get("password");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      alert("Login successful");

      // redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      alert(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-lime rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-ink-900" />
        </div>

        <span
          className="text-xl font-semibold text-ink-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          StockWise
        </span>
      </div>

      <div className="card p-8">
        <h1
          className="text-2xl font-semibold text-ink-50 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sign in
        </h1>

        <p className="text-sm text-ink-400 mb-8">
          Access your inventory dashboard
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label">Email address</label>

            <input
              type="email"
              name="email"
              className="input"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>

            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                className="input pr-11"
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-ink-500 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-lime hover:text-lime-200 transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
