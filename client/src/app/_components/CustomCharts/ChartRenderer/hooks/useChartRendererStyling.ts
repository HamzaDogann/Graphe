import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { DEFAULT_CHART_COLORS, type ChartStylingUpdate } from "@/types/chart";
import type { ChartStyling } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";
import { useChartsStore } from "@/store/useChartsStore";
import { DEBOUNCE_DELAY, THUMBNAIL_DEBOUNCE_DELAY } from "../constants";

interface UseChartRendererStylingParams {
  messageId?: string;
  chartId?: string;
  storedStyling?: ChartStyling;
  colorScheme?: string[];
  onStylingChange?: (styling: Partial<ChartStyling>) => void;
}

interface UseChartRendererStylingResult {
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  localColors: string[];
  localTypography?: ChartStyling["typography"];
  handleStylingChange: (styling: ChartStylingUpdate) => void;
}

export const useChartRendererStyling = ({
  messageId,
  chartId,
  storedStyling,
  colorScheme,
  onStylingChange,
}: UseChartRendererStylingParams): UseChartRendererStylingResult => {
  const updateMessageStyling = useChatStore((state) => state.updateMessageStyling);
  const updateChartStyling = useChartsStore((state) => state.updateChartStyling);
  const updateChartInCache = useChartsStore((state) => state.updateChartInCache);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Partial<ChartStyling>>({});

  const cachedChartStyling = useChartsStore((state) =>
    chartId ? state.chartsDetailCache[chartId]?.styling : undefined,
  );

  const effectiveInitialColors =
    cachedChartStyling?.colors ||
    storedStyling?.colors ||
    colorScheme ||
    DEFAULT_CHART_COLORS;
  const effectiveInitialTypography =
    cachedChartStyling?.typography || storedStyling?.typography;

  const [localColors, setLocalColors] = useState<string[]>(effectiveInitialColors);
  const [localTypography, setLocalTypography] = useState<
    ChartStyling["typography"] | undefined
  >(effectiveInitialTypography);

  const prevCachedStylingRef = useRef<string>(JSON.stringify(cachedChartStyling));

  useEffect(() => {
    const currentCachedKey = JSON.stringify(cachedChartStyling);
    if (cachedChartStyling && currentCachedKey !== prevCachedStylingRef.current) {
      prevCachedStylingRef.current = currentCachedKey;
      if (cachedChartStyling.colors) {
        setLocalColors(cachedChartStyling.colors);
      }
      if (cachedChartStyling.typography) {
        setLocalTypography(cachedChartStyling.typography);
      }
    }
  }, [cachedChartStyling]);

  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (Object.keys(pendingChangesRef.current).length > 0) {
        if (messageId) {
          updateMessageStyling(messageId, pendingChangesRef.current);
        }
        if (chartId) {
          updateChartStyling(chartId, pendingChangesRef.current);
        }
        pendingChangesRef.current = {};
      }
    }, DEBOUNCE_DELAY);
  }, [messageId, chartId, updateMessageStyling, updateChartStyling]);

  const debouncedThumbnailCapture = useCallback(() => {
    if (!chartId || !chartContainerRef.current) return;

    if (thumbnailDebounceRef.current) {
      clearTimeout(thumbnailDebounceRef.current);
    }

    thumbnailDebounceRef.current = setTimeout(async () => {
      try {
        const chartCanvas = chartContainerRef.current?.querySelector(
          ".apexcharts-canvas",
        ) as HTMLElement;
        const targetElement = chartCanvas || chartContainerRef.current;
        if (!targetElement) return;

        const canvas = await html2canvas(targetElement, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const thumbnail = canvas.toDataURL("image/png", 0.8);

        updateChartInCache(chartId, { thumbnail });

        fetch(`/api/charts/${chartId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thumbnail }),
        }).catch((err) => console.error("Failed to update thumbnail:", err));
      } catch (error) {
        console.error("Failed to capture thumbnail after styling change:", error);
      }
    }, THUMBNAIL_DEBOUNCE_DELAY);
  }, [chartId, updateChartInCache]);

  const handleStylingChange = useCallback(
    (styling: ChartStylingUpdate) => {
      if (styling.colors) {
        setLocalColors(styling.colors);
        pendingChangesRef.current.colors = styling.colors;
      }
      if (styling.typography) {
        setLocalTypography(styling.typography);
        pendingChangesRef.current.typography = styling.typography;
      }

      if (onStylingChange) {
        onStylingChange(pendingChangesRef.current);
      }

      debouncedSave();
      debouncedThumbnailCapture();
    },
    [debouncedSave, debouncedThumbnailCapture, onStylingChange],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        if (messageId && Object.keys(pendingChangesRef.current).length > 0) {
          updateMessageStyling(messageId, pendingChangesRef.current);
        }
        if (chartId && Object.keys(pendingChangesRef.current).length > 0) {
          updateChartStyling(chartId, pendingChangesRef.current);
        }
      }
    };
  }, [messageId, chartId, updateMessageStyling, updateChartStyling]);

  useEffect(() => {
    return () => {
      if (thumbnailDebounceRef.current) {
        clearTimeout(thumbnailDebounceRef.current);
      }
    };
  }, []);

  return {
    chartContainerRef,
    localColors,
    localTypography,
    handleStylingChange,
  };
};
