"use client";

import { motion } from "framer-motion";
import { Camera, Palette, Type, Bookmark } from "lucide-react";
import styles from "./SystemResponse.module.scss";

// Graphe Logo SVG Component
const GrapheLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="16" fill="white" />
  </svg>
);

interface SystemResponseProps {
  title?: string;
  description?: string;
}

export const SystemResponse = ({
  title = "Generated Chart",
  description = "I've created a pie chart based on your data. The chart visualizes the distribution of customer segments across different regions, showing the percentage breakdown for each category.",
}: SystemResponseProps) => {
  return (
    <motion.div
      className={styles.responseContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <GrapheLogo />
        </div>
        <span className={styles.title}>{title}</span>
      </div>

      {/* Description */}
      <p className={styles.description}>{description}</p>

      {/* Chart Area */}
      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
          {/* Placeholder Chart - Statik Pie Chart SVG */}
          <svg viewBox="0 0 200 200" className={styles.chartPlaceholder}>
            {/* Pie slices */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#5C85FF"
              strokeWidth="40"
              strokeDasharray="125.6 376.8"
              strokeDashoffset="0"
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#A855F7"
              strokeWidth="40"
              strokeDasharray="100.5 376.8"
              strokeDashoffset="-125.6"
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#22C55E"
              strokeWidth="40"
              strokeDasharray="75.4 376.8"
              strokeDashoffset="-226.1"
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="40"
              strokeDasharray="75.3 376.8"
              strokeDashoffset="-301.5"
              transform="rotate(-90 100 100)"
            />
            {/* Center circle */}
            <circle cx="100" cy="100" r="55" fill="white" />
            {/* Center text */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              fill="#323039"
              fontSize="14"
              fontWeight="600"
            >
              Total
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
            >
              1,234
            </text>
          </svg>

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ background: "#5C85FF" }}
              />
              <span className={styles.legendLabel}>Region A (33%)</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ background: "#A855F7" }}
              />
              <span className={styles.legendLabel}>Region B (27%)</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ background: "#22C55E" }}
              />
              <span className={styles.legendLabel}>Region C (20%)</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ background: "#F59E0B" }}
              />
              <span className={styles.legendLabel}>Region D (20%)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.actionBtn} title="Screenshot">
            <Camera size={18} />
          </button>
          <button className={styles.actionBtn} title="Colors">
            <Palette size={18} />
          </button>
          <button className={styles.actionBtn} title="Font Settings">
            <Type size={18} />
          </button>
          <button className={styles.actionBtn} title="Save Chart">
            <Bookmark size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
