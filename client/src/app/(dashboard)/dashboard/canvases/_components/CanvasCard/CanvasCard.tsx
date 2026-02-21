"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import type { Canvas } from "@/store/useCanvasStore";
import styles from "./CanvasCard.module.scss";

interface CanvasCardProps {
  canvas: Canvas;
}

export const CanvasCard = ({ canvas }: CanvasCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/dashboard/canvases/${canvas.id}`}
      className={styles.canvasCard}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnailWrapper}>
        <Image
          src="/canvas/canvasthumbnail.webp"
          alt={canvas.name}
          fill
          className={styles.thumbnail}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{canvas.name}</h3>

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
    </Link>
  );
};
