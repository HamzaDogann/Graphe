"use client";

import { Upload, Link, Image as ImageIcon } from "lucide-react";
import styles from "./PropertyContents.module.scss";

export const ImageContent = () => {
  return (
    <div className={styles.contentWrapper}>
      {/* Upload Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <ImageIcon size={16} />
          <span>Add Image</span>
        </div>
        <div className={styles.uploadArea}>
          <button className={styles.uploadButton}>
            <Upload size={24} />
            <span>Upload Image</span>
          </button>
          <p className={styles.uploadHint}>Supports PNG, JPG, GIF, SVG</p>
        </div>
      </div>

      {/* URL Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Link size={16} />
          <span>Image URL</span>
        </div>
        <div className={styles.urlInput}>
          <input
            type="url"
            placeholder="Paste image URL..."
            className={styles.textInput}
          />
          <button className={styles.addButton}>Add</button>
        </div>
      </div>

      {/* Recent Images */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Recent Images</span>
        </div>
        <div className={styles.emptyState}>
          <ImageIcon size={32} className={styles.emptyIcon} />
          <p>No recent images</p>
        </div>
      </div>
    </div>
  );
};
