"use client";

import { Pencil, Eraser, Circle, Minus, Palette } from "lucide-react";
import styles from "./PropertyContents.module.scss";

export const DrawContent = () => {
  return (
    <div className={styles.contentWrapper}>
      {/* Drawing Tools */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Pencil size={16} />
          <span>Drawing Tools</span>
        </div>
        <div className={styles.toolGrid}>
          <button className={`${styles.toolButton} ${styles.active}`}>
            <Pencil size={20} />
            <span>Pen</span>
          </button>
          <button className={styles.toolButton}>
            <Eraser size={20} />
            <span>Eraser</span>
          </button>
          <button className={styles.toolButton}>
            <Minus size={20} />
            <span>Line</span>
          </button>
          <button className={styles.toolButton}>
            <Circle size={20} />
            <span>Circle</span>
          </button>
        </div>
      </div>

      {/* Stroke Settings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Stroke Width</span>
        </div>
        <div className={styles.strokeOptions}>
          <button className={`${styles.strokeBtn} ${styles.active}`}>
            <div className={styles.strokeLine} style={{ height: "2px" }} />
          </button>
          <button className={styles.strokeBtn}>
            <div className={styles.strokeLine} style={{ height: "4px" }} />
          </button>
          <button className={styles.strokeBtn}>
            <div className={styles.strokeLine} style={{ height: "6px" }} />
          </button>
          <button className={styles.strokeBtn}>
            <div className={styles.strokeLine} style={{ height: "8px" }} />
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Palette size={16} />
          <span>Color</span>
        </div>
        <div className={styles.colorPalette}>
          <button
            className={`${styles.colorSwatch} ${styles.active}`}
            style={{ background: "#000000" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#EF4444" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#F59E0B" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#22C55E" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#3B82F6" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#8B5CF6" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#EC4899" }}
          />
          <button
            className={styles.colorSwatch}
            style={{ background: "#6B7280" }}
          />
        </div>
      </div>
    </div>
  );
};
