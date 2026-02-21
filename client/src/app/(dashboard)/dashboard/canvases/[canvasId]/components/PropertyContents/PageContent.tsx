"use client";

import { FileText, Maximize, Minimize } from "lucide-react";
import styles from "./PropertyContents.module.scss";

export const PageContent = () => {
  return (
    <div className={styles.contentWrapper}>
      {/* Page Size Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FileText size={16} />
          <span>Page Size</span>
        </div>
        <div className={styles.sizeOptions}>
          <button className={`${styles.sizeOption} ${styles.active}`}>
            <span className={styles.sizeLabel}>A4</span>
            <span className={styles.sizeDimension}>210 × 297 mm</span>
          </button>
          <button className={styles.sizeOption}>
            <span className={styles.sizeLabel}>Letter</span>
            <span className={styles.sizeDimension}>216 × 279 mm</span>
          </button>
          <button className={styles.sizeOption}>
            <span className={styles.sizeLabel}>Legal</span>
            <span className={styles.sizeDimension}>216 × 356 mm</span>
          </button>
          <button className={styles.sizeOption}>
            <span className={styles.sizeLabel}>Custom</span>
            <span className={styles.sizeDimension}>Set your own</span>
          </button>
        </div>
      </div>

      {/* Orientation Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Orientation</span>
        </div>
        <div className={styles.orientationButtons}>
          <button className={`${styles.orientationBtn} ${styles.active}`}>
            <Maximize size={18} />
            <span>Portrait</span>
          </button>
          <button className={styles.orientationBtn}>
            <Minimize size={18} />
            <span>Landscape</span>
          </button>
        </div>
      </div>

      {/* Background Color Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Background</span>
        </div>
        <div className={styles.colorPicker}>
          <input
            type="color"
            defaultValue="#ffffff"
            className={styles.colorInput}
          />
          <span className={styles.colorValue}>#FFFFFF</span>
        </div>
      </div>
    </div>
  );
};
