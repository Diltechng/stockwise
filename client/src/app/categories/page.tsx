"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Loader2,
  Package,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import EmptyState from "@/components/ui/EmptyState";

type Category = {
  id: string;
  name: string;
  description: string;
  products_count: number;
};

type CategoryForm = {
  name: string;
  description: string;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
};

export default function CategoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    role: "admin" | "staff";
  } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const raw = sessionStorage.getItem("user");

    if (raw) {
      setUser(JSON.parse(raw));
    }

    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:4000/api/categories",
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        router.push("/auth/login");
        return;
      }

      const data = await res.json();

      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditCategory(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditCategory(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);

    setForm({
      name: category.name,
      description: category.description || "",
    });

    setModalOpen(true);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setBusy(true);

      if (editCategory) {
        const res = await fetch(
          `http://localhost:4000/api/categories/${editCategory.id}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }
      } else {
        const res = await fetch(
          "http://localhost:4000/api/categories",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }
      }

      await loadCategories();

      closeModal();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setBusy(true);

      const res = await fetch(
        `http://localhost:4000/api/categories/${deleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      await loadCategories();

      setDeleteId(null);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
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

      {loading ? (
        <div className="card">
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-lime" />
          </div>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="Create your first category"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card group p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-lime" />
                </div>

                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 rounded-lg hover:bg-ink-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteId(category.id)}
                      className="p-1.5 rounded-lg hover:bg-red-900/20 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-ink-100">
                  {category.name}
                </h3>

                <p className="text-sm text-ink-400">
                  {category.description || "No description"}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-ink-700 pt-2">
                <Package className="h-4 w-4 text-ink-500" />

                <span className="text-sm text-ink-400">
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
        title={
          editCategory
            ? "Edit Category"
            : "Add Category"
        }
        size="sm"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="label">Name</label>

            <input
              className="input"
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
              rows={3}
              className="input resize-none"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editCategory ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={busy}
        title="Delete Category"
        description="This will permanently delete the category."
      />
    </div>
  );
}