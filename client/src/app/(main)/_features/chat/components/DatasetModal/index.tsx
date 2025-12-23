"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, FileSpreadsheet, FileJson, RefreshCw, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DatasetModal.module.scss";
import { TableView } from "./TableView";
import { JsonView } from "./JsonView";

// Global Store ve Hook
import { useDatasetStore } from "@/store/useDatasetStore";
import { useFileParser } from "../../hooks/useFileParser";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetModal = ({ isOpen, onClose }: Props) => {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GLOBAL STATE (reset fonksiyonunu da çektik)
  const { parsedData, isLoading, setFile, setParsedData, setIsLoading, reset } =
    useDatasetStore();

  const { parseFile, data: newData, loading: newLoading } = useFileParser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setFile(file);
      parseFile(file);
    }
  };

  useEffect(() => {
    if (newData) setParsedData(newData);
    if (newLoading !== undefined) setIsLoading(newLoading);
  }, [newData, newLoading, setParsedData, setIsLoading]);

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteDataset = () => {
    reset();
    onClose();
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.portalWrapper}>
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <div className={styles.modalPositioner}>
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className={styles.modalHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.headerIcon}>
                    {parsedData?.type === "json" ? (
                      <FileJson size={22} />
                    ) : (
                      <FileSpreadsheet size={22} />
                    )}
                  </div>
                  <div className={styles.headerText}>
                    <h3 className={styles.datasetName}>
                      {parsedData?.fileName || "No Data"}
                    </h3>
                    {parsedData && (
                      <span className={styles.datasetMeta}>
                        {parsedData.fileSize} •{" "}
                        {parsedData.type === "table"
                          ? `${parsedData.rows?.length} Rows`
                          : "JSON Object"}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.headerRight}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    accept=".csv, .xlsx, .xls, .json"
                  />

                  {/* Change Button */}
                  <button
                    className={styles.changeBtn}
                    onClick={handleChangeClick}
                  >
                    <RefreshCw size={16} />
                    <span>Change</span>
                  </button>

                  {/* Delete Button (YENİ) */}
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDeleteDataset}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>

                  <div className={styles.divider} />

                  <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className={styles.modalBody}>
                {isLoading ? (
                  <div className={styles.loaderWrapper}>
                    <div className={styles.spinner} />
                    <span className={styles.loaderText}>
                      Processing data...
                    </span>
                  </div>
                ) : (
                  <>
                    {parsedData?.type === "table" &&
                      parsedData.headers &&
                      parsedData.rows && (
                        <TableView
                          headers={parsedData.headers}
                          rows={parsedData.rows}
                        />
                      )}

                    {parsedData?.type === "json" && (
                      <JsonView content={parsedData.content} />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
