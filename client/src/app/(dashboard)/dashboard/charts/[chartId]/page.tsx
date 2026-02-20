"use client";

import { useEffect, useState, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import Image from "next/image";
import { ArrowLeft, Bookmark, Loader2, Trash2 } from "lucide-react";
import { ChartRenderer } from "@/app/_components";
import {
  storedToRenderData,
  StoredChartData,
  ChartStyling,
} from "@/types/chat";
import { useChartsStore } from "@/store/useChartsStore";
import styles from "./chartDetail.module.scss";

// Extension logo paths
const EXTENSION_LOGOS: Record<string, string> = {
  xlsx: "/extensionsLogo/ExcelLogo.webp",
  xls: "/extensionsLogo/ExcelLogo.webp",
  csv: "/extensionsLogo/CsvLogo.png",
  json: "/extensionsLogo/JsonLogo.png",
};

// Helper to get logo path by extension
const getExtensionLogo = (extension: string): string => {
  const ext = extension.toLowerCase().replace(".", "");
  return EXTENSION_LOGOS[ext] || "/extensionsLogo/CsvLogo.png";
};

interface PageProps {
  params: Promise<{ chartId: string }>;
}

export default function ChartDetailPage({ params }: PageProps) {
  const { chartId } = use(params);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const hasStylingChangedRef = useRef(false);

  const {
    chartsDetailCache,
    isLoadingDetail,
    error,
    fetchChartDetail,
    toggleFavorite,
    deleteChart,
    updateChartStyling,
    updateChartInCache,
  } = useChartsStore();

  // Get chart from cache
  const chart = chartsDetailCache[chartId] || null;

  useEffect(() => {
    // Fetch only if not in cache
    if (!chart) {
      fetchChartDetail(chartId);
    }
  }, [chartId, chart, fetchChartDetail]);

  const handleBack = useCallback(async () => {
    // If styling changed and chart is favorite, capture and update thumbnail
    if (
      hasStylingChangedRef.current &&
      chart?.isFavorite &&
      chartContainerRef.current
    ) {
      try {
        const chartCanvas = chartContainerRef.current.querySelector(
          ".apexcharts-canvas",
        ) as HTMLElement;
        const targetElement = chartCanvas || chartContainerRef.current;

        const canvas = await html2canvas(targetElement, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const thumbnail = canvas.toDataURL("image/png", 0.8);

        // Update local state immediately (optimistic)
        updateChartInCache(chartId, { thumbnail });

        // Fire-and-forget API call to update thumbnail
        fetch(`/api/charts/${chartId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thumbnail }),
        }).catch((err) => console.error("Failed to update thumbnail:", err));
      } catch (error) {
        console.error("Failed to capture thumbnail on exit:", error);
      }
    }

    router.push("/dashboard/charts");
  }, [chart?.isFavorite, chartId, router, updateChartInCache]);

  const handleToggleFavorite = () => {
    // Optimistic UI - no await needed
    toggleFavorite(chartId);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    if (!confirm("Are you sure you want to delete this chart?")) return;

    setIsDeleting(true);
    const success = await deleteChart(chartId);
    if (success) {
      router.push("/dashboard/charts");
    } else {
      setIsDeleting(false);
    }
  };

  // Handle styling changes from ChartRenderer
  const handleStylingChange = useCallback(
    (styling: Partial<ChartStyling>) => {
      hasStylingChangedRef.current = true;
      updateChartStyling(chartId, styling);
    },
    [chartId, updateChartStyling],
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert chart data to StoredChartData format for ChartRenderer
  const getStoredChartData = (): StoredChartData | null => {
    if (!chart) return null;

    return {
      type: chart.type as "pie" | "bar" | "line" | "table",
      title: chart.title,
      description: chart.description || undefined,
      createdAt: chart.createdAt,
      datasetInfo: chart.datasetName
        ? {
            name: chart.datasetName,
            extension: chart.datasetExtension || "",
            fullName: `${chart.datasetName}${chart.datasetExtension ? `.${chart.datasetExtension}` : ""}`,
          }
        : undefined,
      data: chart.data as any,
      config: chart.config as any,
      styling: chart.styling as any,
      tableData: chart.tableData as any,
    };
  };

  // Loading state - only show if not in cache
  if (isLoadingDetail && !chart) {
    return (
      <div className={styles.chartDetailPage}>
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className={styles.chartDetailPage}>
        <div className={styles.errorState}>
          <p>{error || "Chart not found"}</p>
          <button onClick={handleBack} className={styles.backBtn}>
            <ArrowLeft size={18} />
            Back to Charts
          </button>
        </div>
      </div>
    );
  }

  const storedChartData = getStoredChartData();
  const renderData = storedChartData
    ? storedToRenderData(storedChartData)
    : null;

  return (
    <div className={styles.chartDetailPage}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button onClick={handleBack} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className={styles.headerActions}>
          <button
            onClick={handleToggleFavorite}
            className={`${styles.actionBtn} ${styles.saveBtn} ${chart.isFavorite ? styles.favorited : ""}`}
            title={chart.isFavorite ? "Remove from saved" : "Save chart"}
          >
            <Bookmark
              size={18}
              fill={chart.isFavorite ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            disabled={isDeleting}
            title="Delete chart"
          >
            {isDeleting ? (
              <Loader2 size={18} className={styles.spinner} />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      </motion.div>

      {/* Title & Description */}
      <motion.div
        className={styles.titleSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className={styles.title}>{chart.title}</h1>
        {chart.description && (
          <p className={styles.description}>{chart.description}</p>
        )}

        <div className={styles.meta}>
          {chart.datasetName && (
            <div className={styles.metaItem}>
              <div className={styles.metaIconWrapper}>
                <Image
                  src={getExtensionLogo(chart.datasetExtension || "csv")}
                  alt="Dataset type"
                  width={24}
                  height={24}
                  className={styles.metaIcon}
                />
              </div>
              <span className={styles.metaText}>
                {chart.datasetName}
                {chart.datasetExtension && `.${chart.datasetExtension}`}
              </span>
            </div>
          )}
          <div className={styles.metaItem}>
            <div className={styles.metaIconWrapper}>
              <Image
                src="/others/ChartGeneratedDate.webp"
                alt="Created date"
                width={24}
                height={24}
                className={styles.metaIcon}
              />
            </div>
            <span className={styles.metaText}>
              {formatDate(chart.createdAt)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        ref={chartContainerRef}
        className={styles.chartSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {renderData && storedChartData && (
          <ChartRenderer
            renderData={renderData}
            storedStyling={storedChartData.styling}
            storedChartData={storedChartData}
            chartId={chartId}
            onStylingChange={handleStylingChange}
            isFavorite={chart.isFavorite}
            hideSaveButton={true}
          />
        )}
      </motion.div>
    </div>
  );
}
