"use client";

import { Square, Circle, Triangle, Star, Hexagon, Heart } from "lucide-react";
import styles from "./PropertyContents.module.scss";

export const ShapesContent = () => {
  return (
    <div className={styles.contentWrapper}>
      {/* Basic Shapes */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Square size={16} />
          <span>Basic Shapes</span>
        </div>
        <div className={styles.shapeGrid}>
          <button className={styles.shapeButton}>
            <Square size={24} />
          </button>
          <button className={styles.shapeButton}>
            <Circle size={24} />
          </button>
          <button className={styles.shapeButton}>
            <Triangle size={24} />
          </button>
          <button className={styles.shapeButton}>
            <Hexagon size={24} />
          </button>
          <button className={styles.shapeButton}>
            <Star size={24} />
          </button>
          <button className={styles.shapeButton}>
            <Heart size={24} />
          </button>
        </div>
      </div>

      {/* Fill & Stroke */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Fill Color</span>
        </div>
        <div className={styles.colorPicker}>
          <input
            type="color"
            defaultValue="#3B82F6"
            className={styles.colorInput}
          />
          <span className={styles.colorValue}>#3B82F6</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Stroke Color</span>
        </div>
        <div className={styles.colorPicker}>
          <input
            type="color"
            defaultValue="#1E40AF"
            className={styles.colorInput}
          />
          <span className={styles.colorValue}>#1E40AF</span>
        </div>
      </div>

      {/* Stroke Width */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Stroke Width</span>
        </div>
        <div className={styles.fontSizeControl}>
          <input
            type="range"
            min="0"
            max="10"
            defaultValue="2"
            className={styles.slider}
          />
          <span className={styles.sliderValue}>2px</span>
        </div>
      </div>

      {/* Corner Radius */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Corner Radius</span>
        </div>
        <div className={styles.fontSizeControl}>
          <input
            type="range"
            min="0"
            max="50"
            defaultValue="0"
            className={styles.slider}
          />
          <span className={styles.sliderValue}>0px</span>
        </div>
      </div>
    </div>
  );
};
