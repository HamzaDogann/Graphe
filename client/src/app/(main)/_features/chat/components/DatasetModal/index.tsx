"use client";

import { useRef } from "react";
import {
  FileSpreadsheet,
  FileJson,
  RefreshCw,
  Trash2,
  Plus, // Yeni ikon eklendi
} from "lucide-react";
import { Modal, ProcessingLoader } from "@/app/_components";
import { TableView } from "./TableView";
import { JsonView } from "./JsonView";
import styles from "./DatasetModal.module.scss";

// Global Store
import { useDatasetStore } from "@/store/useDatasetStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetModal = ({ isOpen, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GLOBAL STATE
  const { parsedData, isLoading, parseFile, reset, error } = useDatasetStore();

  // Veri var mı kontrolü
  const hasData = !!parsedData;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await parseFile(file);
    }
  };

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteDataset = () => {
    reset();
    onClose();
  };

  // Header için sol taraftaki ikon (Veri yoksa varsayılan Spreadsheet ikonu)
  const headerIcon =
    parsedData?.type === "json" ? (
      <FileJson size={22} />
    ) : (
      <FileSpreadsheet size={22} />
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
              <FileSpreadsheet size={48} opacity={0.5} />
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
