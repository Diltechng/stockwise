"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { productsService } from "@/lib/services/products.service";
import { categoriesService } from "@/lib/services/categories.service";
import { Product } from "@/types";
import Modal from "@/components/ui/Modal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";

const EMPTY_FORM = {
  name: "",
  sku: "",
  description: "",
  category_id: "",
  price: "",
  quantity: "",
  min_threshold: "10",
};

export default function ProductsPage() {
  const products = [];
  const meta = [];
  const categories = [];
  const isBusy = true;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{lowStock ? "Low Stock" : "Products"}</h1>
          <p className="text-sm text-ink-400 mt-1">
            {lowStock
              ? "Items below minimum threshold"
              : "Manage your product catalogue"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            className="input pl-9"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="input max-w-[200px]"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {lowStock && (
          <button
            onClick={() => router.push("/products")}
            className="btn-secondary text-sm"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-lime" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              search
                ? "Try a different search term"
                : "Add your first product to get started"
            }
            action={
              isAdmin ? (
                <button
                  onClick={openCreate}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-head">Product</th>
                    <th className="table-head">SKU</th>
                    <th className="table-head">Category</th>
                    <th className="table-head">Price</th>
                    <th className="table-head">Stock</th>
                    <th className="table-head">Status</th>
                    {isAdmin && (
                      <th className="table-head text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLow = p.quantity <= p.min_threshold;
                    return (
                      <tr key={p.id} className="table-row">
                        <td className="table-cell font-medium text-ink-100">
                          {p.name}
                        </td>
                        <td className="table-cell font-mono text-xs text-ink-400">
                          {p.sku}
                        </td>
                        <td className="table-cell text-ink-400">
                          {p.category_name || "—"}
                        </td>
                        <td className="table-cell">
                          ₦
                          {Number(p.price).toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="table-cell font-semibold">
                          {p.quantity}
                        </td>
                        <td className="table-cell">
                          {isLow ? (
                            <span className="badge-warn flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </span>
                          ) : (
                            <span className="badge-in w-fit">OK</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="table-cell text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-1.5 rounded-lg text-ink-500 hover:text-lime hover:bg-ink-700 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editProduct ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Product Name *</label>
            <input
              className="input"
              placeholder="e.g. Wireless Mouse"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">SKU *</label>
            <input
              className={clsx(
                "input",
                !!editProduct && "opacity-60 cursor-not-allowed",
              )}
              placeholder="e.g. MOU-001"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              disabled={!!editProduct}
              required
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category_id}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Price (₦) *</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="label">Initial Quantity</label>
            <input
              className={clsx(
                "input",
                !!editProduct && "opacity-60 cursor-not-allowed",
              )}
              type="number"
              min="0"
              placeholder="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              disabled={!!editProduct}
            />
            {editProduct && (
              <p className="text-xs text-ink-500 mt-1">
                Use Stock page to adjust quantity
              </p>
            )}
          </div>
          <div>
            <label className="label">Min Threshold</label>
            <input className="input" type="number" min="0" placeholder="10" />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional description…"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={isBusy}
            >
              {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              {editProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDelete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete Product"
        description="This will permanently delete the product. Stock history will be preserved."
      />
    </div>
  );
}
