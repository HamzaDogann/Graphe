"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { isValidCanvasId } from "@/lib/generateId";
import { Hash, ArrowLeft, LayoutGrid, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  CanvasWorkspace,
  PropertiesPanel,
  CanvasToolbar,
  CanvasTopBar,
} from "./components";
import styles from "./canvas.module.scss";

export default function CanvasDetailPage() {
  const params = useParams();
  const canvasId = params.canvasId as string;

  const { canvases, isLoaded, isFetching, fetchCanvases, getCanvasById } =
    useCanvasStore();
  const {
    loadCanvas,
    isLoading: isEditorLoading,
    canvasId: loadedCanvasId,
  } = useCanvasEditorStore();
  const { setCollapsed } = useSidebarStore();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    // Collapse sidebar when entering canvas page
    setCollapsed(true);
  }, [setCollapsed]);

  // Fetch canvases if not loaded yet
  useEffect(() => {
    if (!isLoaded && !isFetching && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      fetchCanvases();
    }
  }, [isLoaded, isFetching, hasAttemptedFetch, fetchCanvases]);

  // Load canvas content into editor store
  useEffect(() => {
    const canvas = getCanvasById(canvasId);
    if (canvas && loadedCanvasId !== canvasId) {
      // Canvas exists in list store, now load full content
      loadCanvas(canvasId);
    }
  }, [canvasId, canvases, getCanvasById, loadCanvas, loadedCanvasId]);

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

  // Find the canvas from store
  const canvas = getCanvasById(canvasId);

  // Show loading while fetching canvases or loading editor
  if (
    isFetching ||
    (!isLoaded && !hasAttemptedFetch) ||
    (canvas && isEditorLoading)
  ) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Loading canvas...</p>
      </div>
    );
  }

  // Canvas not found after fetch attempt
  if (!canvas && isLoaded) {
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

  // Still waiting for data
  if (!canvas) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Loading canvas...</p>
      </div>
    );
  }

  return (
    <div className={styles.canvasPage}>
      {/* Top Bar */}
      <CanvasTopBar />

      {/* Canvas Editor Layout */}
      <div className={styles.editorLayout}>
        {/* Canvas Workspace (Center) */}
        <CanvasWorkspace />

        {/* Properties Panel (Right) */}
        <PropertiesPanel />

        {/* Bottom Toolbar - Fixed */}
        <CanvasToolbar />
      </div>
    </div>
  );
}
