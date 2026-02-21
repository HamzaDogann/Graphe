"use client";

import { useState } from "react";
import { CreateCanvasModal } from "@/app/_components/Modal/CreateCanvasModal";
import styles from "./CreateCanvas.module.scss";

interface CreateCanvasButtonProps {
  className?: string;
}

export const CreateCanvasButton = ({ className }: CreateCanvasButtonProps) => {
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);

  return (
    <>
      <div className={`${styles.canvasBtnWrapper} ${className || ""}`}>
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

      {/* Create Canvas Modal */}
      <CreateCanvasModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
      />
    </>
  );
};
