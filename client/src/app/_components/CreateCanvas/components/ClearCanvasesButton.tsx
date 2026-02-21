"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ConfirmationModal } from "@/app/_components/ConfirmationModal/ConfirmationModal";
import styles from "./ClearCanvasesButton.module.scss";

export const ClearCanvasesButton = () => {
  const { clearAllCanvases } = useCanvasStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = () => {
    clearAllCanvases();
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={styles.clearCanvasesBtn}
        onClick={() => setIsModalOpen(true)}
      >
        <Trash2 size={18} />
        Clear Canvases
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Clear All Canvases"
        message="Are you sure you want to delete all canvases? This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
