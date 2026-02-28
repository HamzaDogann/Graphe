"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { FileChartPie, Loader2 } from "lucide-react";
import { CreateCanvasButton } from "@/app/_components/CreateCanvas";
import {
  NewCanvasButton,
  ClearCanvasesButton,
} from "@/app/_components/CreateCanvas/components";
import { CanvasCard } from "./_components";
import styles from "./canvases.module.scss";

export default function CanvasesPage() {
  const { canvases, isLoaded, isFetching, fetchCanvases } = useCanvasStore();

  // Fetch canvases on first load
  useEffect(() => {
    if (!isLoaded && !isFetching) {
      fetchCanvases();
    }
  }, [isLoaded, isFetching, fetchCanvases]);

  // Show loading state on first fetch
  if (!isLoaded && isFetching) {
    return (
      <div className={styles.canvasesPage}>
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading canvases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.canvasesPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FileChartPie size={32} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>My Canvases</h1>
            <p className={styles.subtitle}>
              {canvases.length} canvas{canvases.length !== 1 ? "es" : ""}{" "}
              created
            </p>
          </div>
        </div>

        {canvases.length > 0 && (
          <div className={styles.headerActions}>
            <NewCanvasButton />
            <ClearCanvasesButton />
          </div>
        )}
      </div>

      {canvases.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileChartPie size={52} />
          </div>
          <h2>No canvases yet</h2>
          <p>Create your first canvas to start visualizing your data</p>
          <CreateCanvasButton />
        </div>
      ) : (
        <div className={styles.canvasGrid}>
          {canvases.map((canvas) => (
            <CanvasCard key={canvas.id} canvas={canvas} />
          ))}
        </div>
      )}
    </div>
  );
}
