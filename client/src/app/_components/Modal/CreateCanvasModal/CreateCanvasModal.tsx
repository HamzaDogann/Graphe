"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, FileText } from "lucide-react";
import Image from "next/image";
import { useCanvasStore } from "@/store/useCanvasStore";
import { modalBackdrop, modalContent } from "@/lib/animations";
import styles from "./CreateCanvasModal.module.scss";

interface CreateCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCanvasModal = ({
  isOpen,
  onClose,
}: CreateCanvasModalProps) => {
  const [canvasName, setCanvasName] = useState("");
  const [canvasDescription, setCanvasDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { addCanvasWithSync } = useCanvasStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!canvasName.trim() || isCreating) return;

    setIsCreating(true);

    try {
      // Create canvas - adds to local store + syncs to DB
      const canvasId = await addCanvasWithSync(
        canvasName.trim(),
        canvasDescription.trim() || undefined,
      );

      if (canvasId) {
        // Reset form
        setCanvasName("");
        setCanvasDescription("");
        onClose();

        // Navigate to the new canvas
        router.push(`/dashboard/canvases/${canvasId}`);
      } else {
        console.error("Failed to create canvas");
      }
    } catch (error) {
      console.error("Error creating canvas:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setCanvasName("");
    setCanvasDescription("");
    onClose();
  };

  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.portalWrapper}>
          <motion.div
            className={styles.backdrop}
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCancel}
          />

          <div className={styles.modalPositioner}>
            <motion.div
              className={styles.modal}
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close Button */}
              <button className={styles.closeBtn} onClick={handleCancel}>
                <X size={20} />
              </button>

              {/* Banner Image */}
              <div className={styles.bannerContainer}>
                <Image
                  src="/canvas/CanvasBanner.svg"
                  alt="Create Canvas"
                  width={200}
                  height={150}
                  className={styles.bannerImage}
                  priority
                />
              </div>

              {/* Form Content */}
              <div className={styles.formContent}>
                {/* Canvas Name Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Canvas Name</label>
                  <div className={styles.inputWrapper}>
                    <Type size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter canvas name..."
                      value={canvasName}
                      onChange={(e) => setCanvasName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Canvas Description Textarea */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Canvas Description</label>
                  <div className={styles.textareaWrapper}>
                    <FileText size={18} className={styles.textareaIcon} />
                    <textarea
                      className={styles.textarea}
                      placeholder="Describe your canvas..."
                      value={canvasDescription}
                      onChange={(e) => setCanvasDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.createBtn}
                    onClick={handleCreate}
                    disabled={!canvasName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Canvas"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalElement, document.body);
};

export default CreateCanvasModal;
