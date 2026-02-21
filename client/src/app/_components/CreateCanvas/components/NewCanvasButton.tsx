"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateCanvasModal } from "@/app/_components/Modal/CreateCanvasModal";
import styles from "./NewCanvasButton.module.scss";

export const NewCanvasButton = () => {
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);

  return (
    <>
      <button
        className={styles.newCanvasBtn}
        onClick={() => setIsCanvasModalOpen(true)}
      >
        <Plus size={18} />
        New Canvas
      </button>

      <CreateCanvasModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
      />
    </>
  );
};
