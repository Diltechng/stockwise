"use client";

import { Loader2, Trash2 } from "lucide-react";
import Modal from "./Modal";

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export default function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  loading,
  title = "Delete item",
  description = "This action cannot be undone.",
}: ConfirmDeleteProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-ink-300 mb-6">{description}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger flex items-center gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </Modal>
  );
}
