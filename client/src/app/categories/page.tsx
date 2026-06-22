"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Loader2, Package } from "lucide-react";

import Modal from "@/components/ui/Modal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import EmptyState from "@/components/ui/EmptyState";

type Category = {
  id: number;
  name: string;
  description: string;
  products_count: number;
};

type CategoryForm = {
  name: string;
  description: string;
};

const EMPTY: CategoryForm = {
  name: "",
  description: "",
};

export default function CategoriesPage() {
  const isAdmin = true;

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Accessories",
      description: "Computer accessories and peripherals",
      products_count: 20,
    },
    {
      id: 2,
      name: "Electronics",
      description: "Electronic devices and gadgets",
      products_count: 12,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState<CategoryForm>(EMPTY);

  const isLoading = false;
  const isBusy = false;

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setForm(EMPTY);
  };

  const handleEdit = (category: Category) => {
    setEditItem(category);

    setForm({
      name: category.name,
      description: category.description || "",
    });

    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editItem) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editItem.id
            ? {
                ...c,
                name: form.name,
                description: form.description,
              }
            : c,
        ),
      );
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name,
          description: form.description,
          products_count: 0,
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = () => {
    setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Categories</h1>

          <p className="mt-1 text-sm text-ink-400">
            Organise products by category
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="card">
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-lime" />
          </div>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Create categories to organise your products"
          action={
            isAdmin ? (
              <button
                onClick={openCreate}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card group flex flex-col gap-3 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime/20 bg-lime/10">
                  <Tag className="h-5 w-5 text-lime" />
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-700 hover:text-lime"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteId(category.id)}
                      className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-red-900/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-ink-100">
                  {category.name}
                </h3>

                <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">
                  {category.description || "No description"}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-1.5 border-t border-ink-700 pt-2">
                <Package className="h-3.5 w-3.5 text-ink-500" />

                <span className="text-xs text-ink-400">
                  {category.products_count} products
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Name *</label>

            <input
              className="input"
              placeholder="e.g. Electronics"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label className="label">Description</label>

            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional..."
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
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
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}

              {editItem ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={false}
        title="Delete Category"
        description="This will permanently delete the category."
      />
    </div>
  );
}