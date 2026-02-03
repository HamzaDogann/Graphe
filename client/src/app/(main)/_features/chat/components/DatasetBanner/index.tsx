"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { CreateCanvasModal } from "@/app/_components/Modal/CreateCanvasModal";
import styles from "./DatasetBanner.module.scss";

interface Props {
  fileName: string;
  onInfoClick: () => void; // Tıklama fonksiyonu prop olarak eklendi
}

export const DatasetBanner = ({ fileName, onInfoClick }: Props) => {
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);

  return (
    <>
      <div className={styles.datasetBanner}>
        {/* Sadece bu alana tıklanınca modal açılacak */}
        <div
          className={styles.fileInfo}
          onClick={onInfoClick}
          role="button"
          tabIndex={0}
        >
          <div className={styles.dbIconWrapper}>
            <Database size={22} />
          </div>
          <div className={styles.fileText}>
            <span className={styles.fileLabel}>Dataset</span>
            <span className={styles.fileName}>{fileName}</span>
          </div>
        </div>

        {/* Canvas butonu bağımsız çalışır */}
        <div className={styles.canvasBtnWrapper}>
          <img
            src="/canvasbutton/graphs.svg"
            alt="graphs"
            className={`${styles.canvasSideIcon} ${styles.canvasLeftIcon}`}
            loading="lazy"
          />
          <button
            className={styles.canvasBtn}
            onClick={() => setIsCanvasModalOpen(true)}
          >
            Create Canvas
          </button>
          <img
            src="/canvasbutton/easel.svg"
            alt="easel"
            className={`${styles.canvasSideIcon} ${styles.canvasRightIcon}`}
            loading="lazy"
          />
        </div>
      </div>

      {/* Create Canvas Modal */}
      <CreateCanvasModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
      />
    </>
  );
};
