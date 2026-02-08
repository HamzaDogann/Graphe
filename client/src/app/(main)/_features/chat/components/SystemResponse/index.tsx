"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { ChartRenderer } from "@/app/_components";
import { ChartRenderData } from "@/types/chart";
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
  chartData?: ChartRenderData;
  error?: string;
}

export const SystemResponse = ({
  title = "Response",
  description,
  chartData,
  error,
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
      {description && <p className={styles.description}>{description}</p>}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Chart Rendering */}
      {chartData && !error && (
        <div className={styles.chartSection}>
          <ChartRenderer renderData={chartData} />
        </div>
      )}

      {/* Text-only response (no chart) */}
      {!chartData && !error && description && (
        <div className={styles.textOnlyResponse}>
          <p>{description}</p>
        </div>
      )}
    </motion.div>
  );
};
