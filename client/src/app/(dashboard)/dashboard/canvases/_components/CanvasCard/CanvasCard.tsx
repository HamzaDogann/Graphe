"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Trash2 } from "lucide-react";
import type { Canvas } from "@/store/useCanvasStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ConfirmationModal } from "@/app/_components/ConfirmationModal";
import styles from "./CanvasCard.module.scss";

interface CanvasCardProps {
  canvas: Canvas;
}

export const CanvasCard = ({ canvas }: CanvasCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeCanvasWithSync } = useCanvasStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await removeCanvasWithSync(canvas.id);
    setShowDeleteModal(false);
    setIsDeleting(false);
  };

  return (
    <>
      <Link
        href={`/dashboard/canvases/${canvas.id}`}
        className={styles.canvasCard}
      >
        {/* Thumbnail */}
        <div className={styles.thumbnailWrapper}>
          <Image
            src="/canvas/canvasthumbnail.webp"
            alt={canvas.title}
            fill
            className={styles.thumbnail}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Card Content */}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{canvas.title}</h3>

          {canvas.description && (
            <p className={styles.cardDescription}>{canvas.description}</p>
          )}

          <div className={styles.cardMeta}>
            <span className={styles.date}>
              <Calendar size={12} />
              {formatDate(canvas.createdAt)}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          className={styles.deleteButton}
          onClick={handleDeleteClick}
          title="Delete canvas"
        >
          <Trash2 size={16} />
        </button>
      </Link>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Canvas"
        message={`Are you sure you want to delete "${canvas.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
