"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCanvasStore } from "@/store/useCanvasStore";
import { isValidCanvasId } from "@/lib/generateId";
import { LayoutGrid, Calendar, Hash, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "./canvas.module.scss";

export default function CanvasDetailPage() {
  const params = useParams();
  const router = useRouter();
  const canvasId = params.canvasId as string;

  const { canvases, activeCanvas, setActiveCanvas } = useCanvasStore();

  useEffect(() => {
    // Find and set the active canvas
    const canvas = canvases.find((c) => c.id === canvasId);
    if (canvas) {
      setActiveCanvas(canvas);
    }
  }, [canvasId, canvases, setActiveCanvas]);

  // Find the canvas from store
  const canvas = canvases.find((c) => c.id === canvasId);

  // Validate canvas ID format
  if (!isValidCanvasId(canvasId)) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>
          <Hash size={48} />
        </div>
        <h2>Invalid Canvas ID</h2>
        <p>The canvas ID format is not valid</p>
        <Link href="/dashboard/canvases" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Canvases
        </Link>
      </div>
    );
  }

  // Canvas not found
  if (!canvas) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>
          <LayoutGrid size={48} />
        </div>
        <h2>Canvas Not Found</h2>
        <p>The canvas you&apos;re looking for doesn&apos;t exist</p>
        <Link href="/dashboard/canvases" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Canvases
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.canvasPage}>
      {/* Back Link */}
      <Link href="/dashboard/canvases" className={styles.backLink}>
        <ArrowLeft size={18} />
        Back to Canvases
      </Link>

      {/* Canvas Info Card */}
      <div className={styles.infoCard}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper}>
            <LayoutGrid size={28} />
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.canvasName}>{canvas.name}</h1>
            <span className={styles.canvasId}>
              <Hash size={14} />
              {canvas.id}
            </span>
          </div>
        </div>

        {canvas.description && (
          <div className={styles.descriptionSection}>
            <div className={styles.sectionLabel}>
              <FileText size={16} />
              Description
            </div>
            <p className={styles.description}>{canvas.description}</p>
          </div>
        )}

        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <Calendar size={16} />
            <span>Created: {formatDate(canvas.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Canvas Workspace Area - Placeholder for future charts */}
      <div className={styles.workspaceArea}>
        <div className={styles.workspacePlaceholder}>
          <LayoutGrid size={32} />
          <p>Canvas workspace - Charts will appear here</p>
        </div>
      </div>
    </div>
  );
}
