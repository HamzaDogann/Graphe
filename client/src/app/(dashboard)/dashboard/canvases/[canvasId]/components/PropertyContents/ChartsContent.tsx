"use client";

import {
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  AreaChart,
  Sparkles,
} from "lucide-react";
import styles from "./PropertyContents.module.scss";

export const ChartsContent = () => {
  return (
    <div className={styles.contentWrapper}>
      {/* Chart Types Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <BarChart3 size={16} />
          <span>Chart Types</span>
        </div>
        <div className={styles.chartGrid}>
          <button className={styles.chartTypeCard}>
            <BarChart3 size={24} />
            <span>Bar Chart</span>
          </button>
          <button className={styles.chartTypeCard}>
            <PieChart size={24} />
            <span>Pie Chart</span>
          </button>
          <button className={styles.chartTypeCard}>
            <LineChart size={24} />
            <span>Line Chart</span>
          </button>
          <button className={styles.chartTypeCard}>
            <AreaChart size={24} />
            <span>Area Chart</span>
          </button>
          <button className={styles.chartTypeCard}>
            <Table2 size={24} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* AI Generate Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Sparkles size={16} className={styles.aiIcon} />
          <span>AI Generate</span>
        </div>
        <div className={styles.aiSection}>
          <textarea
            className={styles.aiPrompt}
            placeholder="Describe the chart you want to create..."
            rows={3}
          />
          <button className={styles.aiButton}>
            <Sparkles size={16} />
            <span>Generate Chart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
