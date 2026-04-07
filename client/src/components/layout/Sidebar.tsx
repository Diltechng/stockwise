"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ArrowUpDown,
  LogOut,
  Package2,
  AlertTriangle,
} from "lucide-react";
import Cookies from "js-cookie";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/stock", label: "Stock", icon: ArrowUpDown },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-ink-800 border-r border-ink-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
            <Package2 className="w-4 h-4 text-ink-900" />
          </div>
          <span
            className="text-lg font-semibold text-ink-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            StockWise
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-lime text-ink-900"
                  : "text-ink-300 hover:bg-ink-700 hover:text-ink-50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Low stock alert shortcut */}
        <Link
          href="/products?low_stock=true"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-900/20 transition-all duration-150 mt-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Low Stock Alerts
        </Link>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-ink-700 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-ink-600 flex items-center justify-center text-xs font-semibold text-ink-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-100 truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-400 hover:bg-ink-700 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
