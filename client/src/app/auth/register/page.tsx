"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, ArrowRight } from "lucide-react";

const ROLE = {
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: ROLE.STAFF,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      toast.success("Account created successfully!");

      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: ROLE.STAFF,
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime">
          <Package className="h-5 w-5 text-ink-900" />
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
          className="mb-1 text-2xl font-semibold text-ink-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create Account
        </h1>

        <p className="mb-8 text-sm text-ink-400">
          Join your team on StockWise
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label">Full Name</label>

            <input
              type="text"
              name="full_name"
              className="input"
              placeholder="Jane Smith"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Email Address</label>

            <input
              type="email"
              name="email"
              className="input"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>

            <input
              type="password"
              name="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Role</label>

            <select
              name="role"
              className="input"
              value={formData.role}
              onChange={handleChange}
            >
              <option value={ROLE.STAFF}>Staff</option>
              <option value={ROLE.ADMIN}>Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 flex items-center justify-center gap-2"
          >
            {loading ? "Creating Account..." : "Create Account"}

            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-lime hover:text-lime-200 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}