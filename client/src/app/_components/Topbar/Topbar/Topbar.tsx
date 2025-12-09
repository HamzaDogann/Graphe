"use client";

import { Info, Settings, Zap } from "lucide-react";
import styles from "./Topbar.module.scss";

interface TopbarProps {
  chatName?: string;
}

export function Topbar({ chatName = "New Chart" }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <h1 className={styles.chatName}>{chatName}</h1>
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
