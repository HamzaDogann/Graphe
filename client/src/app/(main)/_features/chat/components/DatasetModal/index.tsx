"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, Trash2, Plus, Database } from "lucide-react";
import { Modal, ProcessingLoader } from "@/app/_components";
import { TableView } from "./TableView";
import { JsonView } from "./JsonView";
import styles from "./DatasetModal.module.scss";

// Global Store
import { useDatasetStore } from "@/store/useDatasetStore";

// Extension logo paths
const EXTENSION_LOGOS: Record<string, string> = {
  xlsx: "/extensionsLogo/ExcelLogo.webp",
  xls: "/extensionsLogo/ExcelLogo.webp",
  csv: "/extensionsLogo/CsvLogo.png",
  json: "/extensionsLogo/JsonLogo.png",
};

// Helper to get logo path by extension
const getExtensionLogo = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return EXTENSION_LOGOS[ext] || "/extensionsLogo/CsvLogo.png";
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetModal = ({ isOpen, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GLOBAL STATE
  const {
    parsedData,
    isLoading,
    parseFile,
    reset,
    error,
    setIsLoading,
    setError,
  } = useDatasetStore();

  // Reset loading state when modal opens/closes to prevent stuck states
  useEffect(() => {
    if (isOpen) {
      // Clear any stuck loading state when modal opens
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen, setIsLoading, setError]);

  // Veri var mı kontrolü
  const hasData = !!parsedData;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Prevent processing if already loading or no file selected
    if (!file || isLoading) {
      return;
    }

    try {
      await parseFile(file);
    } catch {
      // Ensure loading state is cleared on any error
      setIsLoading(false);
    } finally {
      // Reset file input to allow re-selecting the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Safety check: ensure loading is always stopped after operation
      const currentState = useDatasetStore.getState();
      if (currentState.isLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleChangeClick = () => {
    // Prevent clicking while loading
    if (isLoading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDeleteDataset = () => {
    reset();
    onClose();
  };

  // Header için sol taraftaki ikon (Veri yoksa Database ikonu)
  const headerIcon = parsedData?.fileName ? (
    <Image
      src={getExtensionLogo(parsedData.fileName)}
      alt="File type"
      width={34}
      height={34}
      style={{ objectFit: "contain" }}
    />
  ) : (
    <Database size={24} />
  );

  // Header için sağ taraftaki butonlar
  const headerContent = (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept=".csv, .xlsx, .xls, .json"
      />

      {/* Change / Add Data Button */}
      <button className={styles.changeBtn} onClick={handleChangeClick}>
        {hasData ? <RefreshCw size={16} /> : <Plus size={16} />}
        <span>{hasData ? "Change" : "Add Data"}</span>
      </button>

      {/* Delete Button - Sadece veri varsa göster */}
      {hasData && (
        <button className={styles.deleteBtn} onClick={handleDeleteDataset}>
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      )}
    </>
  );

  // Modal Başlığı ve Alt Başlığı
  const modalTitle = hasData ? parsedData.fileName : "No Dataset";
  const modalSubtitle = hasData
    ? `${parsedData.fileSize} • ${
        parsedData.type === "table"
          ? `${parsedData.rows?.length} Rows`
          : "JSON Object"
      }`
    : "Upload a file to view data";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      icon={headerIcon}
      width="large"
      headerContent={headerContent}
    >
      {isLoading ? (
        <ProcessingLoader text="Processing data..." size="medium" />
      ) : error ? (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
        </div>
      ) : (
        <>
          {/* Eğer veri yoksa boş durum mesajı gösterebiliriz veya boş bırakabiliriz */}
          {!hasData && !isLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                color: "#666",
                gap: "10px",
              }}
            >
              <Database size={48} opacity={0.5} />
              <p>No dataset currently loaded.</p>
            </div>
          )}

          {parsedData?.type === "table" &&
            parsedData.headers &&
            parsedData.rows && (
              <TableView headers={parsedData.headers} rows={parsedData.rows} />
            )}

          {parsedData?.type === "json" && (
            <JsonView content={parsedData.content} />
          )}
        </>
      )}
    </Modal>
  );
};
