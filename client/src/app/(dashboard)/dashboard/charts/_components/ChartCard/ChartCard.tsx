"use client";

import Link from "next/link";
import {
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  Calendar,
  Star,
} from "lucide-react";
import styles from "./ChartCard.module.scss";

interface ChartSummary {
  id: string;
  type: string;
  title: string;
  description: string | null;
  datasetName: string | null;
  datasetExtension: string | null;
  thumbnail: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChartCardProps {
  chart: ChartSummary;
  onToggleFavorite?: (chartId: string) => void;
}

const getChartIcon = (type: string) => {
  switch (type) {
    case "pie":
      return <PieChart size={24} />;
    case "bar":
      return <BarChart3 size={24} />;
    case "line":
      return <LineChart size={24} />;
    case "table":
      return <Table2 size={24} />;
    default:
      return <BarChart3 size={24} />;
  }
};

const getChartColor = (type: string) => {
  switch (type) {
    case "pie":
      return "#f59e0b";
    case "bar":
      return "#3b82f6";
    case "line":
      return "#10b981";
    case "table":
      return "#8b5cf6";
    default:
      return "#3b82f6";
  }
};

export const ChartCard = ({ chart, onToggleFavorite }: ChartCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(chart.id);
  };

  return (
    <Link href={`/dashboard/charts/${chart.id}`} className={styles.chartCard}>
      {/* Thumbnail or Placeholder */}
      <div className={styles.thumbnailWrapper}>
        {chart.thumbnail ? (
          <img
            src={chart.thumbnail}
            alt={chart.title}
            className={styles.thumbnail}
          />
        ) : (
          <div
            className={styles.thumbnailPlaceholder}
            style={{ backgroundColor: `${getChartColor(chart.type)}15` }}
          >
            <div
              className={styles.placeholderIcon}
              style={{ color: getChartColor(chart.type) }}
            >
              {getChartIcon(chart.type)}
            </div>
          </div>
        )}

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            className={`${styles.favoriteBtn} ${chart.isFavorite ? styles.favorited : ""}`}
            onClick={handleFavoriteClick}
            title={chart.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={14} fill={chart.isFavorite ? "currentColor" : "none"} />
          </button>
        )}

        {/* Chart type badge */}
        <div
          className={styles.typeBadge}
          style={{ backgroundColor: getChartColor(chart.type) }}
        >
          {getChartIcon(chart.type)}
          <span>{chart.type}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{chart.title}</h3>

        {chart.description && (
          <p className={styles.cardDescription}>{chart.description}</p>
        )}

        <div className={styles.cardMeta}>
          {chart.datasetName && (
            <span className={styles.datasetName}>
              {chart.datasetName}
              {chart.datasetExtension && `.${chart.datasetExtension}`}
            </span>
          )}
          <span className={styles.date}>
            <Calendar size={12} />
            {formatDate(chart.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};
