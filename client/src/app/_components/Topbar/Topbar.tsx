"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Info, Settings, Zap, Check, X } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useChatStore, selectActiveChat } from "@/store/useChatStore";
import { useChartsStore } from "@/store/useChartsStore";
import styles from "./Topbar.module.scss";

export function Topbar() {
  const pathname = usePathname();
  const { activeCanvas } = useCanvasStore();

  // Chat store
  const activeChat = useChatStore(selectActiveChat);
  const updateChatTitle = useChatStore((state) => state.updateChatTitle);

  // Charts store - get current chart from cache
  const chartsDetailCache = useChartsStore((state) => state.chartsDetailCache);

  // Extract chartId from pathname if on chart detail page
  const chartIdMatch = pathname?.match(/\/dashboard\/charts\/([^/]+)/);
  const currentChartId = chartIdMatch?.[1];
  const currentChart = currentChartId
    ? chartsDetailCache[currentChartId]
    : null;

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Start editing on double click
  const handleDoubleClick = useCallback(() => {
    if (pathname?.startsWith("/dashboard/chats/c-") && activeChat) {
      setEditValue(activeChat.title || "New Chat");
      setIsEditing(true);
    }
  }, [pathname, activeChat]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Save title
  const handleSave = useCallback(async () => {
    if (!activeChat) return;

    const trimmedValue = editValue.trim();
    // Önce input'u kapat - optimistic UX
    setIsEditing(false);

    if (trimmedValue && trimmedValue !== activeChat.title) {
      // Arka planda DB'ye kaydet (store zaten optimistic update yapıyor)
      updateChatTitle(activeChat.id, trimmedValue);
    }
  }, [activeChat, editValue, updateChatTitle]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue("");
  }, []);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  // Handle blur (click outside)
  const handleBlur = useCallback(() => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  }, [isEditing, handleSave]);

  // Determine the title based on the current route
  const getTitle = (): string => {
    // Chart detail page
    if (currentChartId && pathname?.startsWith("/dashboard/charts/")) {
      return currentChart?.title || "Chart";
    }

    // Charts list page
    if (pathname === "/dashboard/charts") {
      return "Charts";
    }

    // Canvas detail page
    if (pathname?.startsWith("/dashboard/canvases/canvas-")) {
      return activeCanvas?.name || "Canvas";
    }

    // Canvases list page
    if (pathname === "/dashboard/canvases") {
      return "Canvases";
    }

    // Chat detail page
    if (pathname?.startsWith("/dashboard/chats/c-")) {
      return activeChat?.title || "New Chat";
    }

    // Dashboard home
    if (pathname === "/dashboard") {
      return "Dashboard";
    }

    // Default fallback
    return "Dashboard";
  };

  // Check if title is editable (only for chat pages)
  const isEditable = pathname?.startsWith("/dashboard/chats/c-") && activeChat;

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        {isEditing ? (
          <div className={styles.editContainer}>
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className={styles.editInput}
              maxLength={100}
            />
            <button
              className={styles.editButton}
              onClick={handleSave}
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              className={styles.editButton}
              onClick={handleCancel}
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <h1
            className={`${styles.chatName} ${isEditable ? styles.editable : ""}`}
            onDoubleClick={handleDoubleClick}
            title={isEditable ? "Double-click to edit" : undefined}
          >
            {getTitle()}
          </h1>
        )}
      </div>

      <div className={styles.rightSection}>
        {/* Upgrade Button */}
        <button className={styles.upgradeButton}>
          <Zap size={18} />
          <span>Upgrade</span>
        </button>

        {/* Info Button */}
        <button className={styles.iconButton} aria-label="Info">
          <Info size={20} />
        </button>

        {/* Settings Button */}
        <button className={styles.iconButton} aria-label="Settings">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
