"use client";

import { useCallback, RefObject } from "react";
import { toPng, toJpeg, toSvg } from "html-to-image";

export type ExportFormat = "png" | "jpeg" | "svg";

interface UseCanvasExportOptions {
  canvasRef: RefObject<HTMLDivElement | null>;
  filename?: string;
}

interface ExportOptions {
  format?: ExportFormat;
  quality?: number; // 0-1 for JPEG
  scale?: number; // Scale factor for higher resolution
  backgroundColor?: string;
}

/**
 * Hook for exporting canvas content as image.
 * Uses html-to-image library for high-quality exports.
 */
export const useCanvasExport = ({ canvasRef, filename = "canvas-export" }: UseCanvasExportOptions) => {
  /**
   * Export canvas as an image file
   */
  const exportCanvas = useCallback(
    async (options: ExportOptions = {}) => {
      const { format = "png", quality = 0.95, scale = 2, backgroundColor = "#ffffff" } = options;

      if (!canvasRef.current) {
        console.error("Canvas ref not available");
        return null;
      }

      try {
        const node = canvasRef.current;
        
        // Common options for all formats
        const commonOptions = {
          quality,
          pixelRatio: scale,
          backgroundColor,
          // Filter out Moveable elements from export
          filter: (node: HTMLElement) => {
            const className = node.className;
            if (typeof className === "string") {
              // Exclude Moveable controls and guidelines
              if (className.includes("moveable") || className.includes("rCS")) {
                return false;
              }
            }
            return true;
          },
        };

        let dataUrl: string;

        switch (format) {
          case "jpeg":
            dataUrl = await toJpeg(node, commonOptions);
            break;
          case "svg":
            dataUrl = await toSvg(node, commonOptions);
            break;
          case "png":
          default:
            dataUrl = await toPng(node, commonOptions);
            break;
        }

        // Create download link
        const link = document.createElement("a");
        link.download = `${filename}.${format}`;
        link.href = dataUrl;
        link.click();

        return dataUrl;
      } catch (error) {
        console.error("Failed to export canvas:", error);
        throw error;
      }
    },
    [canvasRef, filename],
  );

  /**
   * Get canvas as data URL without downloading
   */
  const getCanvasDataUrl = useCallback(
    async (options: ExportOptions = {}) => {
      const { format = "png", quality = 0.95, scale = 2, backgroundColor = "#ffffff" } = options;

      if (!canvasRef.current) {
        console.error("Canvas ref not available");
        return null;
      }

      try {
        const node = canvasRef.current;
        
        const commonOptions = {
          quality,
          pixelRatio: scale,
          backgroundColor,
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

        switch (format) {
          case "jpeg":
            return await toJpeg(node, commonOptions);
          case "svg":
            return await toSvg(node, commonOptions);
          case "png":
          default:
            return await toPng(node, commonOptions);
        }
      } catch (error) {
        console.error("Failed to get canvas data URL:", error);
        throw error;
      }
    },
    [canvasRef],
  );

  return {
    exportCanvas,
    getCanvasDataUrl,
  };
};
