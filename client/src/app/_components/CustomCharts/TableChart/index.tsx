"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import html2canvas from "html2canvas";
import {
  ChartActions,
  TypographySettings,
  DEFAULT_TYPOGRAPHY,
} from "../ChartActions";
import { TableChartProps } from "@/types/chart";
import styles from "./TableChart.module.scss";

type SortDirection = "asc" | "desc" | null;

export const TableChart = ({
  headers,
  rows,
  title = "Data Table",
  description,
  sortable = true,
  pageSize = 10,
  showRowNumbers = true,
}: TableChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Typography state
  const [typography, setTypography] =
    useState<TypographySettings>(DEFAULT_TYPOGRAPHY);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === "asc" ? -1 : 1;
      if (bVal == null) return sortDirection === "asc" ? 1 : -1;

      // Number comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [rows, sortColumn, sortDirection]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const totalPages = Math.ceil(rows.length / pageSize);

  // Handle sort
  const handleSort = (column: string) => {
    if (!sortable) return;

    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Format cell value
  const formatValue = (value: any): string => {
    if (value == null) return "—";
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  // Screenshot handler using html2canvas
  const handleScreenshot = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_table.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to capture table:", error);
    }
  }, [title]);

  // Typography change handler
  const handleTypographyChange = useCallback((settings: TypographySettings) => {
    setTypography(settings);
  }, []);

  const handleSave = useCallback(() => {
    console.log("Save table:", title);
  }, [title]);

  // Compute title styles based on typography
  const titleStyle = useMemo(
    () => ({
      fontSize: `${typography.fontSize + 4}px`,
      fontFamily: typography.fontFamily,
      color: typography.color,
      fontWeight: typography.isBold ? 700 : 600,
      fontStyle: typography.isItalic
        ? ("italic" as const)
        : ("normal" as const),
      textDecoration: typography.isUnderline ? "underline" : "none",
    }),
    [typography],
  );

  const descriptionStyle = useMemo(
    () => ({
      fontSize: `${typography.fontSize}px`,
      fontFamily: typography.fontFamily,
      color: typography.color,
      fontStyle: typography.isItalic
        ? ("italic" as const)
        : ("normal" as const),
    }),
    [typography],
  );

  const tableStyle = useMemo(
    () => ({
      fontSize: `${typography.fontSize}px`,
      fontFamily: typography.fontFamily,
      color: typography.color,
    }),
    [typography],
  );

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContent} ref={chartRef}>
        {/* Title */}
        {title && (
          <h3 className={styles.chartTitle} style={titleStyle}>
            {title}
          </h3>
        )}
        {description && (
          <p className={styles.chartDescription} style={descriptionStyle}>
            {description}
          </p>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table} style={tableStyle}>
            <thead>
              <tr>
                {showRowNumbers && (
                  <th className={styles.rowNumberHeader}>#</th>
                )}
                {headers.map((header, index) => (
                  <th
                    key={index}
                    onClick={() => handleSort(header)}
                    className={sortable ? styles.sortable : ""}
                  >
                    <div className={styles.headerContent}>
                      <span>{header}</span>
                      {sortable && sortColumn === header && (
                        <span className={styles.sortIcon}>
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {showRowNumbers && (
                    <td className={styles.rowNumber}>
                      {(currentPage - 1) * pageSize + rowIndex + 1}
                    </td>
                  )}
                  {headers.map((header, colIndex) => (
                    <td key={colIndex}>{formatValue(row[header])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages} ({rows.length} rows)
            </span>
            <div className={styles.pageButtons}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <ChartActions
        onScreenshot={handleScreenshot}
        onTypographyChange={handleTypographyChange}
        onSave={handleSave}
        showColors={false}
        currentTypography={typography}
        orientation="vertical"
      />
    </div>
  );
};
