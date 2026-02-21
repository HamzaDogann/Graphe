"use client";

import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import styles from "./PropertyContents.module.scss";

export const TextContent = () => {
  return (
    <div className={styles.contentWrapper}>
      {/* Text Types Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Type size={16} />
          <span>Add Text</span>
        </div>
        <div className={styles.textTypeList}>
          <button className={styles.textTypeItem}>
            <span className={styles.h1}>Heading 1</span>
          </button>
          <button className={styles.textTypeItem}>
            <span className={styles.h2}>Heading 2</span>
          </button>
          <button className={styles.textTypeItem}>
            <span className={styles.h3}>Heading 3</span>
          </button>
          <button className={styles.textTypeItem}>
            <span className={styles.paragraph}>Paragraph</span>
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Alignment</span>
        </div>
        <div className={styles.alignmentButtons}>
          <button className={`${styles.alignBtn} ${styles.active}`}>
            <AlignLeft size={18} />
          </button>
          <button className={styles.alignBtn}>
            <AlignCenter size={18} />
          </button>
          <button className={styles.alignBtn}>
            <AlignRight size={18} />
          </button>
        </div>
      </div>

      {/* Text Styling */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Style</span>
        </div>
        <div className={styles.styleButtons}>
          <button className={styles.styleBtn}>
            <Bold size={18} />
          </button>
          <button className={styles.styleBtn}>
            <Italic size={18} />
          </button>
          <button className={styles.styleBtn}>
            <Underline size={18} />
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Font Size</span>
        </div>
        <div className={styles.fontSizeControl}>
          <input
            type="range"
            min="8"
            max="72"
            defaultValue="16"
            className={styles.slider}
          />
          <span className={styles.sliderValue}>16px</span>
        </div>
      </div>

      {/* Text Color */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Color</span>
        </div>
        <div className={styles.colorPicker}>
          <input
            type="color"
            defaultValue="#000000"
            className={styles.colorInput}
          />
          <span className={styles.colorValue}>#000000</span>
        </div>
      </div>
    </div>
  );
};
