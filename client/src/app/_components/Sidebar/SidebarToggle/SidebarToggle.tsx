"use client";

import { PanelLeft } from "lucide-react";
import styles from "./SidebarToggle.module.scss";

interface SidebarToggleProps {
  onToggle: () => void;
}

export function SidebarToggle({ onToggle }: SidebarToggleProps) {
  return (
    <button
      className={styles.toggleButton}
      onClick={onToggle}
      aria-label="Open sidebar"
    >
      <PanelLeft size={20} />
    </button>
  );
}
