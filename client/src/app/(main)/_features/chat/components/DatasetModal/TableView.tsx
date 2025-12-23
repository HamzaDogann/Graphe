"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "./DatasetModal.module.scss"; // Veya DatasetModal.module.scss

interface Props {
  headers: string[];
  rows: any[];
}

export const TableView = ({ headers, rows }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    // Ana Container (Hem Header hem Body burada)
    <div ref={parentRef} className={styles.tableScrollContainer}>
      {/* İÇ WRAPPER: Toplam genişliği yönetmek için (min-width ile taşmayı sağlar) */}
      <div className={styles.tableInnerContent}>
        {/* HEADER: Artık içerikle aynı alanda, sticky ile yapışacak */}
        <div className={styles.tableHeader}>
          {headers.map((header, i) => (
            <div key={i} className={styles.headerCell}>
              {header}
            </div>
          ))}
        </div>

        {/* BODY: Sanal Liste */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className={styles.tableRow}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {headers.map((header, i) => (
                  <div key={i} className={styles.tableCell} title={row[header]}>
                    {row[header]?.toString() || "-"}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
