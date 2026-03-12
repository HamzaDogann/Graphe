"use client";

import { useEffect, useCallback, useRef } from "react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: "general" | "edit" | "view" | "element" | "navigation";
  action: () => void;
}

export const SHORTCUT_CATEGORIES = {
  general: "General",
  edit: "Edit",
  view: "View",
  element: "Element",
  navigation: "Navigation",
};

/**
 * Hook that provides keyboard shortcuts for the canvas editor
 * and manages scroll-to-zoom functionality
 */
export const useKeyboardShortcuts = (
  onShowShortcuts?: () => void,
  canvasContainerRef?: React.RefObject<HTMLElement>
) => {
  const {
    selectedElementId,
    selectedElementIds,
    copyElement,
    copyElements,
    pasteElement,
    duplicateElement,
    duplicateElements,
    removeElement,
    removeElements,
    nudgeElement,
    nudgeElements,
    setSelectedElement,
    clearSelection,
    selectAll,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    zoom,
    saveCanvas,
    bringToFront,
    sendToBack,
    elements,
  } = useCanvasEditorStore();

  // Check if multiple elements are selected
  const hasMultipleSelection = selectedElementIds.length > 1;
  const hasAnySelection = selectedElementId || selectedElementIds.length > 0;

  // Track if we're in an input field
  const isInputField = useCallback((target: EventTarget | null): boolean => {
    if (!target) return false;
    const element = target as HTMLElement;
    return (
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.isContentEditable
    );
  }, []);

  // Define all shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // General
    {
      key: "s",
      ctrl: true,
      description: "Save canvas",
      category: "general",
      action: () => saveCanvas(),
    },
    {
      key: "/",
      ctrl: true,
      description: "Show keyboard shortcuts",
      category: "general",
      action: () => onShowShortcuts?.(),
    },
    {
      key: "?",
      shift: true,
      description: "Show keyboard shortcuts",
      category: "general",
      action: () => onShowShortcuts?.(),
    },

    // Edit
    {
      key: "c",
      ctrl: true,
      description: "Copy element(s)",
      category: "edit",
      action: () => {
        if (hasMultipleSelection) {
          copyElements();
        } else {
          copyElement();
        }
      },
    },
    {
      key: "v",
      ctrl: true,
      description: "Paste element(s)",
      category: "edit",
      action: () => pasteElement(),
    },
    {
      key: "d",
      ctrl: true,
      description: "Duplicate element(s)",
      category: "edit",
      action: () => {
        if (hasMultipleSelection) {
          duplicateElements();
        } else {
          duplicateElement();
        }
      },
    },
    {
      key: "Delete",
      description: "Delete selected element(s)",
      category: "edit",
      action: () => {
        if (hasMultipleSelection) {
          removeElements(selectedElementIds);
          clearSelection();
        } else if (selectedElementId) {
          removeElement(selectedElementId);
        }
      },
    },
    {
      key: "Backspace",
      description: "Delete selected element(s)",
      category: "edit",
      action: () => {
        if (hasMultipleSelection) {
          removeElements(selectedElementIds);
          clearSelection();
        } else if (selectedElementId) {
          removeElement(selectedElementId);
        }
      },
    },
    {
      key: "a",
      ctrl: true,
      description: "Select all elements",
      category: "edit",
      action: () => {
        if (elements.length > 0) selectAll();
      },
    },
    {
      key: "Escape",
      description: "Deselect element(s)",
      category: "edit",
      action: () => {
        setSelectedElement(null);
        clearSelection();
      },
    },

    // View / Zoom
    {
      key: "=",
      ctrl: true,
      description: "Zoom in",
      category: "view",
      action: () => zoomIn(),
    },
    {
      key: "+",
      ctrl: true,
      description: "Zoom in",
      category: "view",
      action: () => zoomIn(),
    },
    {
      key: "-",
      ctrl: true,
      description: "Zoom out",
      category: "view",
      action: () => zoomOut(),
    },
    {
      key: "0",
      ctrl: true,
      description: "Reset zoom to 100%",
      category: "view",
      action: () => resetZoom(),
    },
    {
      key: "1",
      ctrl: true,
      description: "Fit to window (50%)",
      category: "view",
      action: () => setZoom(50),
    },
    {
      key: "2",
      ctrl: true,
      description: "Zoom to 100%",
      category: "view",
      action: () => setZoom(100),
    },
    {
      key: "3",
      ctrl: true,
      description: "Zoom to 200%",
      category: "view",
      action: () => setZoom(200),
    },

    // Element positioning
    {
      key: "BracketRight",
      ctrl: true,
      description: "Bring to front",
      category: "element",
      action: () => bringToFront(),
    },
    {
      key: "BracketLeft",
      ctrl: true,
      description: "Send to back",
      category: "element",
      action: () => sendToBack(),
    },

    // Navigation / Nudge
    {
      key: "ArrowUp",
      description: "Move element(s) up (1px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("up", 1);
        } else {
          nudgeElement("up", 1);
        }
      },
    },
    {
      key: "ArrowDown",
      description: "Move element(s) down (1px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("down", 1);
        } else {
          nudgeElement("down", 1);
        }
      },
    },
    {
      key: "ArrowLeft",
      description: "Move element(s) left (1px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("left", 1);
        } else {
          nudgeElement("left", 1);
        }
      },
    },
    {
      key: "ArrowRight",
      description: "Move element(s) right (1px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("right", 1);
        } else {
          nudgeElement("right", 1);
        }
      },
    },
    {
      key: "ArrowUp",
      shift: true,
      description: "Move element(s) up (10px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("up", 10);
        } else {
          nudgeElement("up", 10);
        }
      },
    },
    {
      key: "ArrowDown",
      shift: true,
      description: "Move element(s) down (10px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("down", 10);
        } else {
          nudgeElement("down", 10);
        }
      },
    },
    {
      key: "ArrowLeft",
      shift: true,
      description: "Move element(s) left (10px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("left", 10);
        } else {
          nudgeElement("left", 10);
        }
      },
    },
    {
      key: "ArrowRight",
      shift: true,
      description: "Move element(s) right (10px)",
      category: "navigation",
      action: () => {
        if (hasMultipleSelection) {
          nudgeElements("right", 10);
        } else {
          nudgeElement("right", 10);
        }
      },
    },
  ];

  // Main keyboard event handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Allow typing in input fields (except for specific shortcuts)
      const inInputField = isInputField(e.target);

      // Find matching shortcut
      const matchedShortcut = shortcuts.find((shortcut) => {
        // Check both e.key and e.code for compatibility with bracket keys
        const keyMatch =
          e.key.toLowerCase() === shortcut.key.toLowerCase() ||
          e.key === shortcut.key ||
          e.code === shortcut.key;
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchedShortcut) {
        // Always allow these shortcuts even in input fields
        const alwaysAllowed = ["s", "/", "?", "Escape"];
        const isAlwaysAllowed =
          alwaysAllowed.includes(matchedShortcut.key) &&
          (matchedShortcut.ctrl || matchedShortcut.shift);

        if (inInputField && !isAlwaysAllowed && matchedShortcut.key !== "Escape") {
          return; // Let the input handle it
        }

        e.preventDefault();
        matchedShortcut.action();
      }
    },
    [shortcuts, isInputField]
  );

  // Zoom with Alt + Scroll or Ctrl + Scroll
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Only zoom when Alt OR Ctrl is pressed
      if (e.altKey || e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        const newZoom = Math.min(Math.max(zoom + delta, 25), 400);
        setZoom(newZoom);
      }
    },
    [zoom, setZoom]
  );

  // Set up event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Set up wheel event on container
  useEffect(() => {
    const container = canvasContainerRef?.current || document.body;
    
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel, canvasContainerRef]);

  return {
    shortcuts,
    categories: SHORTCUT_CATEGORIES,
  };
};

/**
 * Get a display string for a shortcut (e.g., "Ctrl + C")
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.meta) parts.push("⌘");
  
  // Format the key nicely
  let key = shortcut.key;
  if (key === "ArrowUp") key = "↑";
  if (key === "ArrowDown") key = "↓";
  if (key === "ArrowLeft") key = "←";
  if (key === "ArrowRight") key = "→";
  if (key === "Delete") key = "Del";
  if (key === "Backspace") key = "⌫";
  if (key === "Escape") key = "Esc";
  if (key === "BracketRight") key = "]";
  if (key === "BracketLeft") key = "[";
  if (key === "=") key = "+";
  
  parts.push(key.toUpperCase());
  
  return parts.join(" + ");
};

/**
 * Group shortcuts by category
 */
export const groupShortcutsByCategory = (
  shortcuts: KeyboardShortcut[]
): Record<string, KeyboardShortcut[]> => {
  return shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>
  );
};
