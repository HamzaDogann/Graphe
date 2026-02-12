import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Type, FileText, Calendar } from "lucide-react";
import styles from "../ChartActions.module.scss";
import { useTooltipPosition } from "../hooks/useTooltipPosition";
import { useClickOutside } from "../hooks/useClickOutside";
import { getExtensionLogo, formatDate } from "../utils";
import type { ChartInfo } from "@/types/chart";

interface ChartInfoTooltipProps {
  chartInfo: ChartInfo;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export const ChartInfoTooltip = ({
  chartInfo,
  onClose,
  anchorRect,
}: ChartInfoTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const position = useTooltipPosition(anchorRect, 340, 300);

  useClickOutside(tooltipRef, onClose);

  if (!anchorRect) return null;

  const fullDatasetName = chartInfo.datasetName
    ? `${chartInfo.datasetName}${chartInfo.datasetExtension ? `.${chartInfo.datasetExtension}` : ""}`
    : null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={styles.chartInfoTooltip}
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.infoHeader}>
        <span className={styles.infoHeaderTitle}>Chart Information</span>
        <button className={styles.infoCloseBtn} onClick={onClose} title="Close">
          <X size={16} />
        </button>
      </div>

      <div className={styles.infoDivider} />

      <div className={styles.infoContent}>
        {fullDatasetName && (
          <div className={styles.infoRow}>
            <div className={styles.infoIconLabel}>
              <Image
                src={getExtensionLogo(chartInfo.datasetExtension || "csv")}
                alt="file"
                width={22}
                height={22}
                style={{ objectFit: "contain" }}
              />
              <span className={styles.infoLabel}>Dataset</span>
            </div>
            <div className={styles.infoValueWithIcon}>
              <span className={styles.infoValue}>{fullDatasetName}</span>
            </div>
          </div>
        )}

        <div className={styles.infoRow}>
          <div className={styles.infoIconLabel}>
            <Type size={18} />
            <span className={styles.infoLabel}>Title</span>
          </div>
          <span className={styles.infoValue}>{chartInfo.title}</span>
        </div>

        {chartInfo.description && (
          <div className={styles.infoRow}>
            <div className={styles.infoIconLabel}>
              <FileText size={18} />
              <span className={styles.infoLabel}>Description</span>
            </div>
            <span className={styles.infoValue}>{chartInfo.description}</span>
          </div>
        )}

        <div className={styles.infoRow}>
          <div className={styles.infoIconLabel}>
            <Calendar size={18} />
            <span className={styles.infoLabel}>Created</span>
          </div>
          <span className={styles.infoValue}>
            {formatDate(chartInfo.createdAt)}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
