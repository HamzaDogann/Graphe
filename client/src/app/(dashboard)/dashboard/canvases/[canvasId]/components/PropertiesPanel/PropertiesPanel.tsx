"use client";

import {
  PanelLeft,
  Sparkles,
  Download,
  ChevronDown,
  Image,
  FileImage,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Type as TypeIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  useCanvasEditorStore,
  TextType,
  TextAlign,
} from "@/store/useCanvasEditorStore";
import { useDatasetStore } from "@/store/useDatasetStore";
import { generateChartConfig } from "@/lib/mockAIService";
import { extractDataSchema } from "@/lib/dataProcessor";
import { toPng, toJpeg } from "html-to-image";
import styles from "./PropertiesPanel.module.scss";

export const PropertiesPanel = () => {
  const {
    isPanelOpen,
    togglePanel,
    selectedElementId,
    elements,
    updateElement,
  } = useCanvasEditorStore();
  const { parsedData } = useDatasetStore();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Export canvas as image
  const handleExport = async (format: "png" | "jpeg") => {
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
            // Exclude Moveable controls from export
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
      } else {
        dataUrl = await toPng(canvasElement, options);
      }

      // Download the image
      const link = document.createElement("a");
      link.download = `canvas-export.${format}`;
      link.href = dataUrl;
      link.click();

      setIsExportOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export canvas. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateChart = async () => {
    if (!selectedElement || selectedElement.type !== "chart" || !prompt) return;
    if (!parsedData?.rows || parsedData.rows.length === 0) {
      alert("Please upload a dataset first!");
      return;
    }

    setIsGenerating(true);
    try {
      const dataSchema = extractDataSchema(parsedData.rows);
      const config = await generateChartConfig({
        userPrompt: prompt,
        dataSchema,
        supportedCharts: ["bar", "pie", "line", "table"],
      });

      updateElement(selectedElement.id, {
        chartConfig: config,
      });

      setPrompt(""); // Clear prompt after success
    } catch (error) {
      console.error("Failed to generate chart config:", error);
      alert("Failed to generate chart. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside
      className={`${styles.propertiesPanel} ${
        !isPanelOpen ? styles.collapsed : ""
      }`}
    >
      <div className={styles.panelHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.panelTitle}>Properties</h3>
          {isPanelOpen && (
            <button
              className={styles.toggleButton}
              onClick={togglePanel}
              aria-label="Close panel"
              title="Close properties panel"
            >
              <PanelLeft size={20} />
            </button>
          )}
        </div>
        {/* Export Dropdown */}
        {isPanelOpen && (
          <div className={styles.exportDropdown} ref={exportDropdownRef}>
            <button
              className={styles.exportButton}
              onClick={() => setIsExportOpen(!isExportOpen)}
              disabled={isExporting}
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown
                size={14}
                className={isExportOpen ? styles.rotated : ""}
              />
            </button>
            {isExportOpen && (
              <div className={styles.exportMenu}>
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
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.panelContent}>
        {selectedElement ? (
          <>
            {/* Element Info */}
            <div className={styles.propertySection}>
              <div className={styles.sectionLabel}>Element Info</div>
              <div className={styles.propertyInfo}>
                <span className={styles.propertyKey}>Type:</span>
                <span className={styles.propertyValue}>
                  {selectedElement.type}
                </span>
              </div>
              <div className={styles.propertyInfo}>
                <span className={styles.propertyKey}>Position:</span>
                <span className={styles.propertyValue}>
                  X: {Math.round(selectedElement.x)}px, Y:{" "}
                  {Math.round(selectedElement.y)}px
                </span>
              </div>
              <div className={styles.propertyInfo}>
                <span className={styles.propertyKey}>Size:</span>
                <span className={styles.propertyValue}>
                  W: {Math.round(selectedElement.width)}px, H:{" "}
                  {Math.round(selectedElement.height)}px
                </span>
              </div>
            </div>

            {/* Chart Configuration (AI-Powered) */}
            {selectedElement.type === "chart" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>
                  <Sparkles size={14} className={styles.aiIcon} />
                  AI Chart Generator
                </div>
                <div className={styles.aiPromptBox}>
                  <textarea
                    className={styles.promptInput}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the chart you want... (e.g., 'Show total sales by city')"
                    rows={4}
                  />
                  <button
                    className={styles.generateButton}
                    onClick={handleGenerateChart}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    {isGenerating ? "Generating..." : "Generate Chart"}
                  </button>
                </div>

                {selectedElement.chartConfig && (
                  <div className={styles.chartInfo}>
                    <div className={styles.propertyInfo}>
                      <span className={styles.propertyKey}>Chart Type:</span>
                      <span className={styles.propertyValue}>
                        {selectedElement.chartConfig.chartType}
                      </span>
                    </div>
                    {selectedElement.chartConfig.title && (
                      <div className={styles.propertyInfo}>
                        <span className={styles.propertyKey}>Title:</span>
                        <span className={styles.propertyValue}>
                          {selectedElement.chartConfig.title}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Text Styling */}
            {selectedElement.type === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>
                  <TypeIcon size={14} />
                  Text Content
                </div>
                <textarea
                  className={styles.textContentInput}
                  value={selectedElement.data || ""}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { data: e.target.value })
                  }
                  placeholder="Enter text..."
                  rows={3}
                />
              </div>
            )}

            {selectedElement.type === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>Text Type</div>
                <div className={styles.textTypeButtons}>
                  {[
                    { value: "heading1", label: "H1" },
                    { value: "heading2", label: "H2" },
                    { value: "heading3", label: "H3" },
                    { value: "paragraph", label: "P" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      className={`${styles.textTypeButton} ${
                        selectedElement.style?.textType === type.value
                          ? styles.active
                          : ""
                      }`}
                      onClick={() =>
                        updateElement(selectedElement.id, {
                          style: {
                            ...selectedElement.style,
                            textType: type.value as TextType,
                          },
                        })
                      }
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedElement.type === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>Alignment</div>
                <div className={styles.alignmentButtons}>
                  <button
                    className={`${styles.alignButton} ${
                      selectedElement.style?.textAlign === "left" ||
                      !selectedElement.style?.textAlign
                        ? styles.active
                        : ""
                    }`}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, textAlign: "left" },
                      })
                    }
                    title="Align Left"
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    className={`${styles.alignButton} ${
                      selectedElement.style?.textAlign === "center"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        style: {
                          ...selectedElement.style,
                          textAlign: "center",
                        },
                      })
                    }
                    title="Center"
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    className={`${styles.alignButton} ${
                      selectedElement.style?.textAlign === "right"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, textAlign: "right" },
                      })
                    }
                    title="Align Right"
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {selectedElement.type === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>Style</div>
                <div className={styles.styleButtons}>
                  <button
                    className={`${styles.styleButton} ${
                      selectedElement.style?.fontWeight === "bold"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        style: {
                          ...selectedElement.style,
                          fontWeight:
                            selectedElement.style?.fontWeight === "bold"
                              ? "normal"
                              : "bold",
                        },
                      })
                    }
                    title="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    className={`${styles.styleButton} ${
                      selectedElement.style?.fontStyle === "italic"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        style: {
                          ...selectedElement.style,
                          fontStyle:
                            selectedElement.style?.fontStyle === "italic"
                              ? "normal"
                              : "italic",
                        },
                      })
                    }
                    title="Italic"
                  >
                    <Italic size={16} />
                  </button>
                </div>
              </div>
            )}

            {selectedElement.type === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>Font Size</div>
                <div className={styles.fontSizeControl}>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={selectedElement.style?.fontSize || 16}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        style: {
                          ...selectedElement.style,
                          fontSize: parseInt(e.target.value),
                        },
                      })
                    }
                    className={styles.fontSizeSlider}
                  />
                  <span className={styles.fontSizeValue}>
                    {selectedElement.style?.fontSize || 16}px
                  </span>
                </div>
              </div>
            )}

            {selectedElement.type === "text" && (
              <div className={styles.propertySection}>
                <div className={styles.sectionLabel}>Color</div>
                <div className={styles.colorControl}>
                  <input
                    type="color"
                    value={selectedElement.style?.color || "#000000"}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        style: {
                          ...selectedElement.style,
                          color: e.target.value,
                        },
                      })
                    }
                    className={styles.colorPicker}
                  />
                  <span className={styles.colorValue}>
                    {selectedElement.style?.color || "#000000"}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Select an element to view properties</p>
          </div>
        )}
      </div>
    </aside>
  );
};
