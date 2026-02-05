"use client";

import { PanelLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import { useDatasetStore } from "@/store/useDatasetStore";
import { generateChartConfig } from "@/lib/mockAIService";
import { extractDataSchema } from "@/lib/dataProcessor";
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

  const selectedElement = elements.find((el) => el.id === selectedElementId);

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
                  X: {selectedElement.x}, Y: {selectedElement.y}
                </span>
              </div>
              <div className={styles.propertyInfo}>
                <span className={styles.propertyKey}>Size:</span>
                <span className={styles.propertyValue}>
                  W: {selectedElement.w}, H: {selectedElement.h}
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
                <div className={styles.sectionLabel}>Text Styling</div>
                <div className={styles.placeholderText}>
                  Font size, color, and alignment controls coming soon
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
