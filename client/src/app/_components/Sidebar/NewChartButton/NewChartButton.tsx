"use client";
import { Plus } from "lucide-react";
import styles from "./NewChartButton.module.scss";

interface NewChartButtonProps {
  collapsed: boolean;
}

export function NewChartButton({ collapsed }: NewChartButtonProps) {
  const handleNewChart = () => {
    console.log("Creating new chart...");
  };

  return (
    <button
      className={`${styles.newChartButton} ${
        collapsed ? styles.collapsed : ""
      }`}
      onClick={handleNewChart}
    >
      {collapsed ? (
        <Plus size={20} className={styles.icon} />
      ) : (
        <span className={styles.label}>New Chart</span>
      )}
    </button>
  );
}
