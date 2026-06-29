"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Package, ArrowRight } from "lucide-react";
import {useRouter} from "next/navigation"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account created successfully");
        router.push("/auth/login");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
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

        <span className="text-xl font-semibold text-ink-50">StockWise</span>
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-semibold text-ink-50 mb-1">
          Create account
        </h1>

        <p className="text-sm text-ink-400 mb-8">Join your team on StockWise</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label">Full name</label>

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
            <label className="label">Email address</label>

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
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Creating..." : "Create account"}

            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-sm text-ink-500 text-center mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-lime hover:text-lime-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
