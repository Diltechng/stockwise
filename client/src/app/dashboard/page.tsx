"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import clsx from "clsx";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: "lime" | "amber" | "red" | "blue";
  sub?: string;
}) {
  const accentMap = {
    lime: "bg-lime/10 text-lime border-lime/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const iconClass = accent
    ? accentMap[accent]
    : "bg-ink-700 text-ink-300 border-ink-600";

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl border flex items-center justify-center",
            iconClass,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <p
          className="text-3xl font-semibold text-ink-50"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>

        <p className="text-sm text-ink-400 mt-0.5">{label}</p>

        {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ActivityRow({ item }: any) {
  const isIn = item.type === "IN";

  return (
    <div className="table-row flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isIn
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400",
          )}
        >
          {isIn ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-ink-100">
            {item.product_name}
          </p>

          <p className="text-xs text-ink-500">
            {item.sku} · {item.user_name}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p
          className={clsx(
            "text-sm font-semibold",
            isIn ? "text-green-400" : "text-red-400",
          )}
        >
          {isIn ? "+" : "-"}
          {item.quantity}
        </p>

        <p className="text-xs text-ink-500">
          {new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  const stats = {
    total_products: 120,
    low_stock_count: 8,
    total_value: 2500000,

    category_breakdown: [
      {
        name: "Electronics",
        total_quantity: 120,
      },
      {
        name: "Accessories",
        total_quantity: 80,
      },
      {
        name: "Furniture",
        total_quantity: 45,
      },
    ],

    recent_activity: [
      {
        id: 1,
        product_name: "Wireless Mouse",
        sku: "MOU-001",
        type: "IN",
        quantity: 20,
        user_name: "Admin",
        created_at: new Date(),
      },
      {
        id: 2,
        product_name: "Mechanical Keyboard",
        sku: "KEY-002",
        type: "OUT",
        quantity: 5,
        user_name: "Admin",
        created_at: new Date(),
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-lime" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="page-title">Dashboard</h1>

        <p className="text-sm text-ink-400 mt-1">Overview of your inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Products"
          value={stats.total_products}
          icon={Package}
          accent="lime"
        />

        <StatCard
          label="Low Stock Items"
          value={stats.low_stock_count}
          icon={AlertTriangle}
          accent="amber"
          sub="Needs attention"
        />

        <StatCard
          label="Inventory Value"
          value={`₦${stats.total_value.toLocaleString("en-NG")}`}
          icon={DollarSign}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="card p-6 xl:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-lime" />

            <h2 className="text-sm font-semibold text-ink-100 uppercase tracking-wider">
              Stock by Category
            </h2>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.category_breakdown} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fill: "#787868", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: "#787868", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar dataKey="total_quantity" radius={[6, 6, 0, 0]}>
                {stats.category_breakdown.map((_entry, index) => (
                  <Cell
                    key={index}
                    fill={index % 2 === 0 ? "#c8f53c" : "#545448"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card xl:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-ink-700">
            <ArrowUpRight className="w-4 h-4 text-lime" />

            <h2 className="text-sm font-semibold text-ink-100 uppercase tracking-wider">
              Recent Activity
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {stats.recent_activity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
