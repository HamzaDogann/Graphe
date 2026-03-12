"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BarChart3, Plus, Pencil } from "lucide-react";
import { useChartsStore, ChartSummary } from "@/store/useChartsStore";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import styles from "./PropertyContents.module.scss";

export const ChartsContent = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Charts store
  const { chartsList, chartsListLoaded, isLoadingList, fetchChartsList } =
    useChartsStore();

  // Canvas store
  const { addElement, elements } = useCanvasEditorStore();

  // Fetch charts on mount
  useEffect(() => {
    if (!chartsListLoaded) {
      fetchChartsList();
    }
  }, [chartsListLoaded, fetchChartsList]);

  // Filter charts based on search query
  const filteredCharts = useMemo(() => {
    if (!searchQuery.trim()) return chartsList;

    const query = searchQuery.toLowerCase();
    return chartsList.filter(
      (chart) =>
        chart.title.toLowerCase().includes(query) ||
        (chart.description && chart.description.toLowerCase().includes(query)),
    );
  }, [chartsList, searchQuery]);

  // Handle Edit Chart - navigate to chart detail page
  const handleEditChart = (chartId: string) => {
    router.push(`/dashboard/charts/${chartId}`);
  };

  // Handle Add to Canvas - add chart thumbnail as chart element
  const handleAddToCanvas = (chart: ChartSummary) => {
    if (!chart.thumbnail) return;

    const newElement = {
      id: `chart-${Date.now()}`,
      type: "chart" as const,
      x: 50,
      y: 50 + elements.length * 20, // Offset each new element slightly
      width: 400,
      height: 300,
      zIndex: elements.length + 1,
      chartConfig: {
        imageBase64: chart.thumbnail,
        chartId: chart.id,
        chartTitle: chart.title,
      },
    };

    addElement(newElement);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className={styles.contentWrapper}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search charts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={handleClearSearch}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Charts List */}
      <div className={styles.chartsListSection}>
        <div className={styles.chartsListHeader}>
          <div className={styles.sectionHeader}>
            <BarChart3 size={16} />
            <span>My Charts</span>
          </div>
          <span className={styles.chartsCount}>
            {chartsList.length} {chartsList.length === 1 ? "Chart" : "Charts"}
          </span>
        </div>

        {isLoadingList ? (
          <div className={styles.loadingState}>
            <span>Loading charts...</span>
          </div>
        ) : filteredCharts.length === 0 ? (
          <div className={styles.emptyState}>
            <BarChart3 size={32} className={styles.emptyIcon} />
            <p>{searchQuery ? "No charts found" : "No charts yet"}</p>
          </div>
        ) : (
          <div className={styles.chartsList}>
            {filteredCharts.map((chart) => (
              <div key={chart.id} className={styles.chartListItem}>
                <div className={styles.chartThumbnailWrapper}>
                  {chart.thumbnail ? (
                    <img
                      src={chart.thumbnail}
                      alt={chart.title}
                      className={styles.chartThumbnail}
                    />
                  ) : (
                    <div className={styles.chartThumbnailPlaceholder}>
                      <BarChart3 size={32} />
                    </div>
                  )}
                </div>
                <span className={styles.chartItemTitle}>{chart.title}</span>
                {chart.description && (
                  <span className={styles.chartItemDescription}>
                    {chart.description.length > 80
                      ? `${chart.description.slice(0, 80)}...`
                      : chart.description}
                  </span>
                )}

                {/* Hover Actions */}
                <div className={styles.chartItemActions}>
                  <button
                    className={styles.chartActionBtn}
                    onClick={() => handleEditChart(chart.id)}
                    title="Edit Chart"
                  >
                    <Pencil size={14} />
                    <span>Edit Chart</span>
                  </button>
                  <button
                    className={`${styles.chartActionBtn} ${styles.primary}`}
                    onClick={() => handleAddToCanvas(chart)}
                    disabled={!chart.thumbnail}
                    title="Add to Canvas"
                  >
                    <Plus size={14} />
                    <span>Add to Canvas</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
