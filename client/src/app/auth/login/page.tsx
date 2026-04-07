"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Eye, EyeOff, Package, ArrowRight, Loader2 } from "lucide-react";
import { authService } from "@/lib/services/auth.service";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
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
                className="input pr-11"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
              ></button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            Sign in
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

      {/* Demo credentials */}
      <div className="mt-4 p-4 rounded-xl border border-ink-700/50 bg-ink-800/40">
        <p className="text-xs text-ink-500 font-medium mb-2 uppercase tracking-wider">
          Demo credentials
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-ink-400">
            <span className="text-lime">Admin:</span> admin@stockwise.com /
            admin123
          </p>
          <p className="text-xs text-ink-400">
            <span className="text-ink-300">Staff:</span> staff@stockwise.com /
            staff123
          </p>
        </div>
      </div>
    </div>
  );
}
