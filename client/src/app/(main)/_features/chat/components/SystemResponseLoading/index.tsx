"use client";

import { motion } from "framer-motion";
import styles from "./SystemResponseLoading.module.scss";

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

export const SystemResponseLoading = () => {
  return (
    <motion.div
      className={styles.loadingContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={styles.logoWrapper}>
        <GrapheLogo />
      </div>
      <div className={styles.loadingBars}>
        <div className={styles.bar} style={{ width: "80%" }} />
        <div className={styles.bar} style={{ width: "60%" }} />
      </div>
    </motion.div>
  );
};
