"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Package, ArrowRight, Loader2 } from "lucide-react";
import { authService } from "@/lib/services/auth.service";

export default function RegisterPage() {
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
          Create account
        </h1>
        <p className="text-sm text-ink-400 mb-8">Join your team on StockWise</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="Jane Smith" required />
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            Create account <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-sm text-ink-500 text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-lime hover:text-lime-200 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
