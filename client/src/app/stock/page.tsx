"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { stockService } from "@/lib/services/stock.service";
import { productsService } from "@/lib/services/products.service";
import { StockHistory } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

const EMPTY_FORM = { product_id: "", quantity: "", note: "" };

function HistoryRow({ item }: { item: StockHistory }) {
  const isIn = item.type === "IN";
  return (
    <tr className="table-row">
      <td className="table-cell">
        <div>
          <p className="font-medium text-ink-100">{item.product_name}</p>
          <p className="text-xs text-ink-500 font-mono">{item.sku}</p>
        </div>
      </td>
      <td className="table-cell">
        <span className={clsx(isIn ? "badge-in" : "badge-out")}>
          {isIn ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {item.type}
        </span>
      </td>
      <td className="table-cell">
        <span
          className={clsx(
            "font-semibold",
            isIn ? "text-green-400" : "text-red-400",
          )}
        >
          {isIn ? "+" : "-"}
          {item.quantity}
        </span>
      </td>
      <td className="table-cell text-ink-400">{item.user_name}</td>
      <td className="table-cell text-ink-500 text-xs">{item.note || "—"}</td>
      <td className="table-cell text-ink-400 text-xs">
        {new Date(item.created_at).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
    </tr>
  );
}

export default function StockPage() {
  const history = [];
  const meta = [];

  const StockForm = ({ type }: { type: "IN" | "OUT" }) => (
    <form className="flex flex-col gap-4">
      <div>
        <label className="label">Search Product</label>
        <input className="input mb-2" placeholder="Search by name or SKU…" />
        <select className="input" required>
          <option value="">Select a product</option>
          {filteredProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) — {p.quantity} in stock
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Quantity *</label>
        <input
          className="input"
          type="number"
          min="1"
          placeholder="0"
          required
        />
      </div>
      <div>
        <label className="label">Note</label>
        <input
          className="input"
          placeholder={
            type === "IN"
              ? "e.g. Supplier delivery"
              : "e.g. Customer order #123"
          }
          value={form.note}
        />
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button type="button" className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={addMutation.isPending || removeMutation.isPending}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 disabled:opacity-40",
            type === "IN"
              ? "bg-green-600 text-white hover:bg-green-500"
              : "bg-red-700 text-white hover:bg-red-600",
          )}
        >
          {type === "IN" ? "Add Stock" : "Remove Stock"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Stock</h1>
          <p className="text-sm text-ink-400 mt-1">Track all stock movements</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-danger flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4" /> Remove Stock
          </button>
          <button className="flex items-center gap-2 bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-green-600 active:scale-95 transition-all text-sm">
            <ArrowUpRight className="w-4 h-4" /> Add Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="input max-w-[160px]">
          <option value="">All movements</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-lime" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={ArrowUpDown}
            title="No stock movements yet"
            description="Add or remove stock to see history here"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-head">Product</th>
                    <th className="table-head">Type</th>
                    <th className="table-head">Qty</th>
                    <th className="table-head">By</th>
                    <th className="table-head">Note</th>
                    <th className="table-head">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <HistoryRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
            {meta && meta.total_pages > 1 && (
              <Pagination
                page={page}
                totalPages={meta.total_pages}
                total={meta.total}
                limit={meta.limit}
                onPage={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Add Stock Modal */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(EMPTY_FORM);
          setProductSearch("");
        }}
        title="Add Stock"
        size="sm"
      >
        <StockForm type="IN" />
      </Modal>

      {/* Remove Stock Modal */}
      <Modal
        open={removeOpen}
        onClose={() => {
          setRemoveOpen(false);
          setForm(EMPTY_FORM);
          setProductSearch("");
        }}
        title="Remove Stock"
        size="sm"
      >
        <StockForm type="OUT" />
      </Modal>
    </div>
  );
}
