"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  ClipboardPaste,
  Trash2,
  CopyPlus,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  PencilLine,
} from "lucide-react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import type { ChartElement, ImageElement } from "@/types/canvas";
import styles from "./ElementContextMenu.module.scss";

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ElementContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  dividerAfter?: boolean;
  disabled?: boolean;
  isDelete?: boolean;
}

export const ElementContextMenu = ({
  isOpen,
  position,
  onClose,
}: ElementContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    clipboard,
    clipboardMultiple,
    elements,
    clearSelection,
  } = useCanvasEditorStore();

  // Check if multiple elements are selected
  const hasMultipleSelection = selectedElementIds.length > 1;
  const hasAnySelection = selectedElementId || selectedElementIds.length > 0;

  // Check if selected element is at top or bottom layer
  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const isTopLayer =
    selectedElement &&
    sortedElements[sortedElements.length - 1]?.id === selectedElementId;
  const isBottomLayer =
    selectedElement && sortedElements[0]?.id === selectedElementId;

  // Check if no element is selected
  const noElementSelected = !selectedElementId;

  // Check if selected element is a chart with chartId (supports both chart and legacy image types)
  const getChartId = (): string | null => {
    if (!selectedElement) return null;

    if (selectedElement.type === "chart") {
      return (selectedElement as ChartElement).chartConfig?.chartId || null;
    }

    // Backward compatibility: image elements may have chartId
    if (selectedElement.type === "image") {
      return (selectedElement as ImageElement).imageConfig?.chartId || null;
    }

    return null;
  };

  const chartId = getChartId();

  // Build menu items dynamically
  const menuItems: MenuItem[] = [
    // Edit Chart - only show for single chart element with chartId
    ...(chartId && !hasMultipleSelection
      ? [
          {
            id: "editChart",
            label: "Edit Chart",
            icon: <PencilLine size={16} />,
            action: () => {
              router.push(`/dashboard/charts/${chartId}`);
              onClose();
            },
            dividerAfter: true,
          },
        ]
      : []),
    {
      id: "copy",
      label: hasMultipleSelection ? "Copy All" : "Copy",
      icon: <Copy size={16} />,
      shortcut: "Ctrl+C",
      action: () => {
        if (hasMultipleSelection) {
          copyElements();
        } else {
          copyElement();
        }
        onClose();
      },
      disabled: !hasAnySelection,
    },
    {
      id: "paste",
      label: "Paste",
      icon: <ClipboardPaste size={16} />,
      shortcut: "Ctrl+V",
      action: () => {
        pasteElement();
        onClose();
      },
      disabled: !clipboard && clipboardMultiple.length === 0,
    },
    {
      id: "duplicate",
      label: hasMultipleSelection ? "Duplicate All" : "Duplicate",
      icon: <CopyPlus size={16} />,
      shortcut: "Ctrl+D",
      action: () => {
        if (hasMultipleSelection) {
          duplicateElements();
        } else {
          duplicateElement();
        }
        onClose();
      },
      disabled: !hasAnySelection,
      dividerAfter: true,
    },
    {
      id: "bringToFront",
      label: "Bring to Front",
      icon: <ArrowUpToLine size={16} />,
      shortcut: "Ctrl+]",
      action: () => {
        bringToFront();
        onClose();
      },
      disabled:
        !hasAnySelection ||
        hasMultipleSelection ||
        isTopLayer ||
        elements.length <= 1,
    },
    {
      id: "bringForward",
      label: "Bring Forward",
      icon: <ArrowUp size={16} />,
      action: () => {
        bringForward();
        onClose();
      },
      disabled:
        !hasAnySelection ||
        hasMultipleSelection ||
        isTopLayer ||
        elements.length <= 1,
    },
    {
      id: "sendBackward",
      label: "Send Backward",
      icon: <ArrowDown size={16} />,
      action: () => {
        sendBackward();
        onClose();
      },
      disabled:
        !hasAnySelection ||
        hasMultipleSelection ||
        isBottomLayer ||
        elements.length <= 1,
    },
    {
      id: "sendToBack",
      label: "Send to Back",
      icon: <ArrowDownToLine size={16} />,
      shortcut: "Ctrl+[",
      action: () => {
        sendToBack();
        onClose();
      },
      disabled:
        !hasAnySelection ||
        hasMultipleSelection ||
        isBottomLayer ||
        elements.length <= 1,
      dividerAfter: true,
    },
    {
      id: "delete",
      label: hasMultipleSelection ? "Delete All" : "Delete",
      icon: <Trash2 size={16} />,
      shortcut: "Del",
      action: () => {
        if (hasMultipleSelection) {
          removeElements(selectedElementIds);
          clearSelection();
        } else if (selectedElementId) {
          removeElement(selectedElementId);
        }
        onClose();
      },
      disabled: !hasAnySelection,
      isDelete: true,
    },
  ];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid immediate close from the same click
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu within viewport
  const getAdjustedPosition = useCallback(() => {
    const menuWidth = 200;
    const menuHeight = 320;
    const padding = 16;

    let x = position.x;
    let y = position.y;

    // Check right edge
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }

    // Check bottom edge
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    // Check left edge
    if (x < padding) {
      x = padding;
    }

    // Check top edge
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  }, [position]);

  const adjustedPosition = getAdjustedPosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className={styles.contextMenu}
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.5,
          }}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            transformOrigin: "top left",
          }}
        >
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                className={`${styles.menuItem} ${item.disabled ? styles.disabled : ""} ${item.isDelete ? styles.deleteItem : ""}`}
                onClick={item.action}
                disabled={item.disabled}
              >
                <span className={styles.iconWrapper}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {item.shortcut && (
                  <span className={styles.shortcut}>{item.shortcut}</span>
                )}
              </button>
              {item.dividerAfter && <div className={styles.divider} />}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
