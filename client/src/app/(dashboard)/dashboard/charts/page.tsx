"use client";

import { useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { ChartCard } from "./_components";
import { useChartsStore } from "@/store/useChartsStore";
import styles from "./charts.module.scss";

export default function ChartsPage() {
  const {
    chartsList,
    isLoadingList,
    chartsListLoaded,
    error,
    fetchChartsList,
    toggleFavorite,
  } = useChartsStore();

  useEffect(() => {
    // Only fetch if not already loaded
    if (!chartsListLoaded) {
      fetchChartsList();
    }
  }, [chartsListLoaded, fetchChartsList]);

  const handleToggleFavorite = (chartId: string) => {
    // Optimistic UI - no await needed
    toggleFavorite(chartId);
  };

  if (isLoadingList && !chartsListLoaded) {
    return (
      <div className={styles.chartsPage}>
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading charts...</p>
        </div>
      </div>
    );
  }

  if (error && !chartsListLoaded) {
    return (
      <div className={styles.chartsPage}>
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartsPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <BarChart3 size={32} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Saved Charts</h1>
            <p className={styles.subtitle}>
              {chartsList.length} chart{chartsList.length !== 1 ? "s" : ""}{" "}
              saved
            </p>
          </div>
        </div>
      </div>

      {chartsList.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <BarChart3 size={64} />
          </div>
          <h2>No saved charts yet</h2>
          <p>
            Save charts from your conversations by clicking the star icon on any
            chart
          </p>
        </div>
      ) : (
        <div className={styles.chartGrid}>
          {chartsList.map((chart) => (
            <ChartCard
              key={chart.id}
              chart={chart}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
