"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { categoriesService } from "@/lib/services/categories.service";
import { Category } from "@/types";
import Modal from "@/components/ui/Modal";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";

const EMPTY = { name: "", description: "" };

export default function CategoriesPage() {
  const isAdmin = true;
  const 

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="text-sm text-ink-400 mt-1">
            Organise products by category
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {/* Grid */}
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-lime" />
        </div>
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Create categories to organise your products"
          action={
            isAdmin ? (
              <button
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="card p-5 flex flex-col gap-3 group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-lime" />
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-lg text-ink-500 hover:text-lime hover:bg-ink-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-ink-100">cat</h3>
                  <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                  </p>
              </div>
              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-ink-700">
                <Package className="w-3.5 h-3.5 text-ink-500" />
                <span className="text-xs text-ink-400">
                  20 product
                </span>
              </div>
            </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <form className="flex flex-col gap-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="input"
              placeholder="e.g. Electronics"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional…"
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
              {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              {editItem ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
     
    </div>
  );
}
