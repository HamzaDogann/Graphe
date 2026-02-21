"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Undo2,
  Redo2,
  Cloud,
  Download,
  Image,
  FileImage,
  FileType,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { dropdownFromTop, tooltipPopover } from "@/lib/animations";
import styles from "./CanvasTopBar.module.scss";

export const CanvasTopBar = () => {
  const router = useRouter();
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );

  const handleBack = () => {
    router.push("/dashboard/canvases");
  };

  const fileMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fileMenuRef.current &&
        !fileMenuRef.current.contains(e.target as Node)
      ) {
        setIsFileMenuOpen(false);
      }
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Undo/Redo handlers (placeholder)
  const handleUndo = () => {
    console.log("Undo action");
    // TODO: Implement undo functionality
  };

  const handleRedo = () => {
    console.log("Redo action");
    // TODO: Implement redo functionality
  };

  // Export handlers
  const handleExport = async (format: "png" | "jpeg" | "svg") => {
    setIsExporting(true);
    try {
      const canvasElement = document.querySelector(
        '[data-canvas-export="true"]',
      ) as HTMLElement;
      if (!canvasElement) {
        alert("Canvas not found!");
        return;
      }

      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node: HTMLElement) => {
          const className = node.className;
          if (typeof className === "string") {
            if (className.includes("moveable") || className.includes("rCS")) {
              return false;
            }
          }
          return true;
        },
      };

      let dataUrl: string;
      if (format === "jpeg") {
        dataUrl = await toJpeg(canvasElement, options);
      } else if (format === "svg") {
        dataUrl = await toSvg(canvasElement, options);
      } else {
        dataUrl = await toPng(canvasElement, options);
      }

      const link = document.createElement("a");
      link.download = `canvas-export.${format}`;
      link.href = dataUrl;
      link.click();

      setIsExportMenuOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export canvas. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.topBar}>
      {/* Left: Back & File Menu */}
      <div className={styles.leftSection}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className={styles.fileMenuWrapper} ref={fileMenuRef}>
          <button
            className={styles.fileButton}
            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
          >
            <span>File</span>
            <ChevronDown
              size={14}
              className={`${styles.chevron} ${isFileMenuOpen ? styles.rotated : ""}`}
            />
          </button>

          <AnimatePresence>
            {isFileMenuOpen && (
              <motion.div
                className={styles.fileMenu}
                variants={dropdownFromTop}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className={styles.menuPlaceholder}>
                  <span>Menu options coming soon...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center: Undo/Redo & Save Status */}
      <div className={styles.centerSection}>
        <div className={styles.historyButtons}>
          <button
            className={styles.historyButton}
            onClick={handleUndo}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            className={styles.historyButton}
            onClick={handleRedo}
            aria-label="Redo"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.saveStatus}>
          <Cloud size={16} className={styles.cloudIcon} />
          <span>
            {saveStatus === "saved"
              ? "Saved"
              : saveStatus === "saving"
                ? "Saving..."
                : "Unsaved"}
          </span>
        </div>
      </div>

      {/* Right: Export Button */}
      <div className={styles.rightSection}>
        <div className={styles.exportWrapper} ref={exportMenuRef}>
          <button
            className={styles.exportButton}
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isExporting}
          >
            <Download size={16} />
            <span>Export</span>
            <ChevronDown
              size={14}
              className={`${styles.chevron} ${isExportMenuOpen ? styles.rotated : ""}`}
            />
          </button>

          <AnimatePresence>
            {isExportMenuOpen && (
              <motion.div
                className={styles.exportMenu}
                variants={tooltipPopover}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <button
                  className={styles.exportMenuItem}
                  onClick={() => handleExport("png")}
                  disabled={isExporting}
                >
                  <Image size={16} />
                  <span>Export as PNG</span>
                </button>
                <button
                  className={styles.exportMenuItem}
                  onClick={() => handleExport("jpeg")}
                  disabled={isExporting}
                >
                  <FileImage size={16} />
                  <span>Export as JPEG</span>
                </button>
                <button
                  className={styles.exportMenuItem}
                  onClick={() => handleExport("svg")}
                  disabled={isExporting}
                >
                  <FileType size={16} />
                  <span>Export as SVG</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
