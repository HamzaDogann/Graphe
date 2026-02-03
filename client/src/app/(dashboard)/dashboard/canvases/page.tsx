"use client";

import Link from "next/link";
import { useCanvasStore } from "@/store/useCanvasStore";
import { LayoutGrid, Plus, Calendar, FileText } from "lucide-react";
import styles from "./canvases.module.scss";

export default function CanvasesPage() {
  const { canvases } = useCanvasStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={styles.canvasesPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <LayoutGrid size={28} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>My Canvases</h1>
            <p className={styles.subtitle}>
              {canvases.length} canvas{canvases.length !== 1 ? "es" : ""}{" "}
              created
            </p>
          </div>
        </div>
      </div>

      {canvases.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <LayoutGrid size={48} />
          </div>
          <h2>No canvases yet</h2>
          <p>Create your first canvas to start visualizing your data</p>
        </div>
      ) : (
        <div className={styles.canvasGrid}>
          {canvases.map((canvas) => (
            <Link
              key={canvas.id}
              href={`/dashboard/canvases/${canvas.id}`}
              className={styles.canvasCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FileText size={20} />
                </div>
                <span className={styles.cardId}>
                  {canvas.id.slice(0, 18)}...
                </span>
              </div>

              <h3 className={styles.cardTitle}>{canvas.name}</h3>

              {canvas.description && (
                <p className={styles.cardDescription}>
                  {canvas.description.length > 80
                    ? `${canvas.description.slice(0, 80)}...`
                    : canvas.description}
                </p>
              )}

              <div className={styles.cardFooter}>
                <Calendar size={14} />
                <span>{formatDate(canvas.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
