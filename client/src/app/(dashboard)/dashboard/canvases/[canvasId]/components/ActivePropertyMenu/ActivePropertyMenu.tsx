"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ActivePropertyMenu.module.scss";

// Animation variants for the sliding panel
const panelVariants = {
  hidden: {
    width: 0,
    opacity: 0,
  },
  visible: {
    width: 280,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
};

// Animation for content
const contentVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

interface ActivePropertyMenuProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export const ActivePropertyMenu = ({
  isOpen,
  title,
  description,
  onClose,
  children,
}: ActivePropertyMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.propertyMenu}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={styles.menuInner}>
            {/* Header */}
            <div className={styles.menuHeader}>
              <div className={styles.headerText}>
                <h3 className={styles.menuTitle}>{title}</h3>
                {description && (
                  <p className={styles.menuDescription}>{description}</p>
                )}
              </div>

              {/* Close Button - Top Right */}
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <motion.div
              className={styles.menuContent}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
