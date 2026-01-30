"use client";

import styles from "./ProcessingLoader.module.scss";

interface ProcessingLoaderProps {
  text?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export const ProcessingLoader = ({
  text = "Processing data...",
  size = "medium",
  fullScreen = false,
}: ProcessingLoaderProps) => {
  return (
    <div
      className={`${styles.loaderWrapper} ${
        fullScreen ? styles.fullScreen : ""
      } ${styles[size]}`}
    >
      <div className={styles.spinner} />
      <span className={styles.loaderText}>{text}</span>
    </div>
  );
};

export default ProcessingLoader;
