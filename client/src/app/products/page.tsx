"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";

import Modal from "@/components/ui/Modal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

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
  const loadProducts = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:4000/api/products");

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const data = await res.json();

      const formatted = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        category_id: product.categoryId,
        category_name: product.category?.name || "No Category",
        price: product.price,
        quantity: product.quantity,
        min_threshold: product.minThreshold,
      }));

      setProducts(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const rawUserData = sessionStorage.getItem("user");

    if (rawUserData) {
      setUser(JSON.parse(rawUserData));
    }

    loadProducts();
  }, []);

  const [user, setUser] = useState<{
    id: number;
    email: string;
    role: "admin" | "staff";
  } | null>(null);
  type Product = {
    id: number;
    name: string;
    sku: string;
    description?: string;
    category_id?: number;
    category_name: string;
    price: number;
    quantity: number;
    min_threshold: number;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const [categories] = useState([
    { id: 1, name: "Accessories" },
    { id: 2, name: "Electronics" },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const isAdmin = user?.role === "admin";

  const meta = {
    total_pages: 1,
    total: products.length,
    limit: 10,
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter
      ? String(p.category_name) === String(categoryFilter)
      : true;

    return matchesSearch && matchesCategory;
  });

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsBusy(true);

      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        min_threshold: Number(form.min_threshold),
      };

      if (editProduct) {
        const res = await fetch(`http://localhost:4000/api/products/${editProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.log(errorData);
          throw new Error(errorData.error || "Failed to update product");
        }
      } else {
        const token = sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const res = await fetch("http://localhost:4000/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create product");
        }
      }

      await loadProducts();

      closeModal();
    } finally {
      setIsBusy(false);
    }
    try {
      setIsBusy(true);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "Failed to update product",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      category_id: product.category_id || "",
      price: String(product.price),
      quantity: String(product.quantity),
      min_threshold: String(product.min_threshold),
    });

    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsBusy(true);

      const res = await fetch(`http://localhost:4000/api/products/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      await loadProducts();

      setDeleteId(null);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Products</h1>

          <p className="text-sm text-ink-400 mt-1">
            Manage your product catalogue
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input max-w-[200px]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>

          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isAdmin && (
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-lime" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Add your first product to get started"
              action={
                <button
                  onClick={openCreate}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
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
                    {filteredProducts.map((p: any) => {
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
                            {p.category_name}
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
                                <AlertTriangle className="w-3 h-3" />
                                Low
                              </span>
                            ) : (
                              <span className="badge-in w-fit">OK</span>
                            )}
                          </td>

                          {isAdmin && (
                            <td className="table-cell text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(p)}
                                  className="p-1.5 rounded-lg text-ink-500 hover:text-lime hover:bg-ink-700 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setDeleteId(p.id)}
                                  className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                >
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

              <Pagination
                page={page}
                totalPages={meta.total_pages}
                total={meta.total}
                limit={meta.limit}
                onPage={setPage}
              />
            </>
          )}
        </div>
      )}

      {/* Modal */}
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

            <select
              className="input"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
            >
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
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
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
          </div>

          <div>
            <label className="label">Min Threshold</label>

            <input
              className="input"
              type="number"
              min="0"
              placeholder="10"
              value={form.min_threshold}
              onChange={(e) =>
                setForm({
                  ...form,
                  min_threshold: e.target.value,
                })
              }
            />
          </div>

          <div className="col-span-2">
            <label className="label">Description</label>

            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional description…"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
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

      {/* Delete Confirm */}
      <ConfirmDelete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={false}
        title="Delete Product"
        description="This will permanently delete the product."
      />
    </div>
  );
}
