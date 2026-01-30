"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Modal.module.scss";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  width?: "small" | "medium" | "large" | "full";
  showCloseButton?: boolean;
  headerContent?: React.ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  width = "large",
  showCloseButton = true,
  headerContent,
  className,
}: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
              className={`${styles.modalContent} ${styles[width]} ${className || ""}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header - Only show if title or headerContent exists */}
              {(title || headerContent) && (
                <div className={styles.modalHeader}>
                  <div className={styles.headerLeft}>
                    {icon && <div className={styles.headerIcon}>{icon}</div>}
                    {title && (
                      <div className={styles.headerText}>
                        <h2 className={styles.modalTitle}>{title}</h2>
                        {subtitle && (
                          <span className={styles.modalSubtitle}>
                            {subtitle}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.headerRight}>
                    {headerContent}
                    {showCloseButton && (
                      <>
                        {headerContent && <div className={styles.divider} />}
                        <button className={styles.closeBtn} onClick={onClose}>
                          <X size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className={styles.modalBody}>{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
