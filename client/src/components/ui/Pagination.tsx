"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPage }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-ink-700">
      <p className="text-xs text-ink-400">
        Showing <span className="text-ink-200">{from}–{to}</span> of{" "}
        <span className="text-ink-200">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className={clsx(
            "p-1.5 rounded-lg transition-colors",
            page <= 1
              ? "text-ink-600 cursor-not-allowed"
              : "text-ink-400 hover:bg-ink-700 hover:text-ink-200"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-ink-500 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={clsx(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                  p === page
                    ? "bg-lime text-ink-900"
                    : "text-ink-400 hover:bg-ink-700 hover:text-ink-200"
                )}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className={clsx(
            "p-1.5 rounded-lg transition-colors",
            page >= totalPages
              ? "text-ink-600 cursor-not-allowed"
              : "text-ink-400 hover:bg-ink-700 hover:text-ink-200"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
