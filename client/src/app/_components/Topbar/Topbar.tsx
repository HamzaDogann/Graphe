"use client";

import { usePathname } from "next/navigation";
import { Info, Settings, Zap } from "lucide-react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useChatStore } from "@/store/useChatStore";
import styles from "./Topbar.module.scss";

export function Topbar() {
  const pathname = usePathname();
  const { activeCanvas } = useCanvasStore();
  const { activeChat } = useChatStore();

  // Determine the title based on the current route
  const getTitle = (): string => {
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
      return activeChat?.name || "New Chat";
    }

    // Dashboard home
    if (pathname === "/dashboard") {
      return "Dashboard";
    }

    // Default fallback
    return "Dashboard";
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <h1 className={styles.chatName}>{getTitle()}</h1>
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
