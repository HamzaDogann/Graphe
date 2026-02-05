"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCanvasStore } from "@/store/useCanvasStore";
import { isValidCanvasId } from "@/lib/generateId";
import { Hash, ArrowLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { CanvasWorkspace, PropertiesPanel, CanvasToolbar } from "./components";
import styles from "./canvas.module.scss";

export default function CanvasDetailPage() {
  const params = useParams();
  const canvasId = params.canvasId as string;

  const { canvases, setActiveCanvas } = useCanvasStore();

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

  return (
    <div className={styles.canvasPage}>
      {/* Canvas Editor Layout */}
      <div className={styles.editorLayout}>
        {/* Canvas Workspace (Left) */}
        <CanvasWorkspace />

        {/* Properties Panel (Right) */}
        <PropertiesPanel />

        {/* Bottom Toolbar - Fixed */}
        <CanvasToolbar />
      </div>
    </div>
  );
}
