/**
 * Auto-save hook for canvas editor
 * 
 * Watches for canvas changes and automatically saves after debounce period.
 * Uses the store's isDirty flag to track unsaved changes.
 */

import { useEffect, useRef, useCallback } from "react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";

// Debounce delay in milliseconds
const AUTO_SAVE_DELAY = 2500;

/**
 * Hook to enable auto-save functionality for canvas.
 * 
 * @param enabled - Whether auto-save is enabled (default: true)
 * @returns Object with manual save function and save status
 */
export function useCanvasAutoSave(enabled: boolean = true) {
  const {
    canvasId,
    isDirty,
    isSaving,
    lastSavedAt,
    saveCanvas,
  } = useCanvasEditorStore();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Manual save function
  const save = useCallback(async () => {
    if (!canvasId || isSaving) return;
    
    try {
      await saveCanvas();
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [canvasId, isSaving, saveCanvas]);

  // Auto-save effect
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Skip if auto-save disabled, no canvas loaded, or not dirty
    if (!enabled || !canvasId || !isDirty || isSaving) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounce timeout
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      try {
        await saveCanvas();
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, AUTO_SAVE_DELAY);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, canvasId, isDirty, isSaving, saveCanvas]);

  return {
    save,
    isSaving,
    isDirty,
    lastSavedAt,
    canvasId,
  };
}

/**
 * Get save status text for display
 */
export function getSaveStatusText(
  isDirty: boolean,
  isSaving: boolean,
  lastSavedAt: Date | null
): string {
  if (isSaving) {
    return "Saving...";
  }
  
  if (isDirty) {
    return "Unsaved changes";
  }
  
  if (lastSavedAt) {
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 10) {
      return "Saved just now";
    }
    if (seconds < 60) {
      return `Saved ${seconds}s ago`;
    }
    if (minutes < 60) {
      return `Saved ${minutes}m ago`;
    }
    return `Saved ${hours}h ago`;
  }
  
  return "Not saved";
}
