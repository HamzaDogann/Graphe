"use client";

import { useRef, useEffect } from "react";
import { FileSpreadsheet, FileJson, RefreshCw, Trash2 } from "lucide-react";
import { Modal, ProcessingLoader } from "@/app/_components";
import { TableView } from "./TableView";
import { JsonView } from "./JsonView";
import styles from "./DatasetModal.module.scss";

// Global Store ve Hook
import { useDatasetStore } from "@/store/useDatasetStore";
import { useFileParser } from "../../hooks/useFileParser";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetModal = ({ isOpen, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GLOBAL STATE
  const { parsedData, isLoading, setFile, setParsedData, setIsLoading, reset } =
    useDatasetStore();

  const { parseFile, data: newData, loading: newLoading } = useFileParser();

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

  // Header için icon
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

      {/* Change Button */}
      <button className={styles.changeBtn} onClick={handleChangeClick}>
        <RefreshCw size={16} />
        <span>Change</span>
      </button>

      {/* Delete Button */}
      <button className={styles.deleteBtn} onClick={handleDeleteDataset}>
        <Trash2 size={16} />
        <span>Delete</span>
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={parsedData?.fileName || "No Data"}
      subtitle={
        parsedData
          ? `${parsedData.fileSize} • ${
              parsedData.type === "table"
                ? `${parsedData.rows?.length} Rows`
                : "JSON Object"
            }`
          : undefined
      }
      icon={headerIcon}
      width="large"
      headerContent={headerContent}
    >
      {isLoading ? (
        <ProcessingLoader text="Processing data..." size="medium" />
      ) : (
        <>
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
