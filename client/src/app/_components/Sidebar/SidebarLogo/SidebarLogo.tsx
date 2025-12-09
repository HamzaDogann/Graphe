"use client";

import { PanelLeft } from "lucide-react";
import styles from "./SidebarLogo.module.scss";

interface SidebarLogoProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarLogo({ collapsed, onToggle }: SidebarLogoProps) {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoWrapper}>
        <div className={styles.logoIcon}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="16" fill="url(#logoGradient)" />
            <defs>
              <linearGradient
                id="logoGradient"
                x1="0"
                y1="0"
                x2="32"
                y2="32"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#667eea" />
                <stop offset="1" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!collapsed && <span className={styles.logoText}>Graphe</span>}
      </div>

      <button
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <PanelLeft size={20} />
      </button>
    </div>
  );
}
