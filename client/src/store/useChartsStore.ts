/**
 * Charts Store
 * 
 * Manages charts caching, styling updates, and synchronization
 * - Cache charts list to avoid refetching
 * - Cache chart details for instant navigation
 * - Sync styling changes between message charts and charts page
 * - Optimistic UI updates
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ChartStyling } from "@/types/chat";

// ===== TYPES =====

export interface ChartSummary {
  id: string;
  type: string;
  title: string;
  description: string | null;
  datasetName: string | null;
  datasetExtension: string | null;
  thumbnail: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChartDetail extends ChartSummary {
  data: unknown[];
  config: unknown;
  styling: ChartStyling;
  tableData: unknown;
}

interface ChartsState {
  // Charts list cache
  chartsList: ChartSummary[];
  chartsListLoaded: boolean;
  isLoadingList: boolean;

  // Chart details cache (keyed by chartId)
  chartsDetailCache: Record<string, ChartDetail>;
  isLoadingDetail: boolean;
  currentChartId: string | null;

  // Error handling
  error: string | null;
}

interface ChartsActions {
  // Fetch operations
  fetchChartsList: () => Promise<void>;
  fetchChartDetail: (chartId: string) => Promise<ChartDetail | null>;

  // Chart operations
  toggleFavorite: (chartId: string) => Promise<boolean>;
  deleteChart: (chartId: string) => Promise<boolean>;
  updateChartStyling: (chartId: string, styling: Partial<ChartStyling>) => void;

  // Cache management
  addChartToCache: (chart: ChartDetail) => void;
  updateChartInCache: (chartId: string, updates: Partial<ChartDetail>) => void;
  removeChartFromCache: (chartId: string) => void;
  getChartFromCache: (chartId: string) => ChartDetail | null;

  // Utility
  clearError: () => void;
  invalidateCache: () => void;
}

type ChartsStore = ChartsState & ChartsActions;

// Debounce map for styling updates
const stylingDebounceTimers: Record<string, NodeJS.Timeout> = {};
const DEBOUNCE_DELAY = 1500;

export const useChartsStore = create<ChartsStore>()(
  devtools(
    (set, get) => ({
      // ===== STATE =====
      chartsList: [],
      chartsListLoaded: false,
      isLoadingList: false,
      chartsDetailCache: {},
      isLoadingDetail: false,
      currentChartId: null,
      error: null,

      // ===== FETCH OPERATIONS =====

      fetchChartsList: async () => {
        // If already loaded, don't refetch
        if (get().chartsListLoaded && get().chartsList.length > 0) {
          return;
        }

        set({ isLoadingList: true, error: null });

        try {
          const response = await fetch("/api/charts");
          if (!response.ok) {
            throw new Error("Failed to fetch charts");
          }

          const data = await response.json();
          set({
            chartsList: data.charts || [],
            chartsListLoaded: true,
            isLoadingList: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch charts",
            isLoadingList: false,
          });
        }
      },

      fetchChartDetail: async (chartId: string): Promise<ChartDetail | null> => {
        // Check cache first
        const cached = get().chartsDetailCache[chartId];
        if (cached) {
          set({ currentChartId: chartId });
          return cached;
        }

        set({ isLoadingDetail: true, error: null, currentChartId: chartId });

        try {
          const response = await fetch(`/api/charts/${chartId}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Chart not found");
            }
            throw new Error("Failed to fetch chart");
          }

          const data = await response.json();
          const chart = data.chart as ChartDetail;

          // Add to cache
          set((state) => ({
            chartsDetailCache: {
              ...state.chartsDetailCache,
              [chartId]: chart,
            },
            isLoadingDetail: false,
          }));

          return chart;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch chart",
            isLoadingDetail: false,
          });
          return null;
        }
      },

      // ===== CHART OPERATIONS =====

      toggleFavorite: async (chartId: string): Promise<boolean> => {
        const { chartsList, chartsDetailCache } = get();
        const chart = chartsDetailCache[chartId] || chartsList.find((c) => c.id === chartId);

        if (!chart) return false;

        const newFavorite = !chart.isFavorite;

        // Optimistic update - list
        set((state) => ({
          chartsList: state.chartsList.map((c) =>
            c.id === chartId ? { ...c, isFavorite: newFavorite } : c
          ),
        }));

        // Optimistic update - detail cache
        if (chartsDetailCache[chartId]) {
          set((state) => ({
            chartsDetailCache: {
              ...state.chartsDetailCache,
              [chartId]: { ...state.chartsDetailCache[chartId], isFavorite: newFavorite },
            },
          }));
        }

        try {
          const response = await fetch(`/api/charts/${chartId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isFavorite: newFavorite }),
          });

          if (!response.ok) {
            throw new Error("Failed to toggle favorite");
          }

          return true;
        } catch (error) {
          // Rollback on error
          set((state) => ({
            chartsList: state.chartsList.map((c) =>
              c.id === chartId ? { ...c, isFavorite: !newFavorite } : c
            ),
            chartsDetailCache: state.chartsDetailCache[chartId]
              ? {
                  ...state.chartsDetailCache,
                  [chartId]: { ...state.chartsDetailCache[chartId], isFavorite: !newFavorite },
                }
              : state.chartsDetailCache,
            error: "Failed to toggle favorite",
          }));
          return false;
        }
      },

      deleteChart: async (chartId: string): Promise<boolean> => {
        try {
          const response = await fetch(`/api/charts/${chartId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete chart");
          }

          // Remove from cache
          set((state) => {
            const { [chartId]: _, ...restCache } = state.chartsDetailCache;
            return {
              chartsList: state.chartsList.filter((c) => c.id !== chartId),
              chartsDetailCache: restCache,
            };
          });

          return true;
        } catch (error) {
          set({ error: "Failed to delete chart" });
          return false;
        }
      },

      updateChartStyling: (chartId: string, styling: Partial<ChartStyling>) => {
        // Optimistic update - immediately update cache
        set((state) => {
          const cachedChart = state.chartsDetailCache[chartId];
          if (!cachedChart) return state;

          return {
            chartsDetailCache: {
              ...state.chartsDetailCache,
              [chartId]: {
                ...cachedChart,
                styling: { ...cachedChart.styling, ...styling },
              },
            },
          };
        });

        // Debounced DB save
        if (stylingDebounceTimers[chartId]) {
          clearTimeout(stylingDebounceTimers[chartId]);
        }

        stylingDebounceTimers[chartId] = setTimeout(async () => {
          try {
            const response = await fetch(`/api/charts/${chartId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ styling: get().chartsDetailCache[chartId]?.styling }),
            });

            if (!response.ok) {
              console.error("Failed to save chart styling");
            }
          } catch (error) {
            console.error("Failed to save chart styling:", error);
          }
        }, DEBOUNCE_DELAY);
      },

      // ===== CACHE MANAGEMENT =====

      addChartToCache: (chart: ChartDetail) => {
        set((state) => ({
          chartsDetailCache: {
            ...state.chartsDetailCache,
            [chart.id]: chart,
          },
          // Also add to list if not exists
          chartsList: state.chartsList.some((c) => c.id === chart.id)
            ? state.chartsList
            : [
                {
                  id: chart.id,
                  type: chart.type,
                  title: chart.title,
                  description: chart.description,
                  datasetName: chart.datasetName,
                  datasetExtension: chart.datasetExtension,
                  thumbnail: chart.thumbnail,
                  isFavorite: chart.isFavorite,
                  createdAt: chart.createdAt,
                  updatedAt: chart.updatedAt,
                },
                ...state.chartsList,
              ],
        }));
      },

      updateChartInCache: (chartId: string, updates: Partial<ChartDetail>) => {
        set((state) => {
          const cachedChart = state.chartsDetailCache[chartId];
          return {
            chartsDetailCache: cachedChart
              ? {
                  ...state.chartsDetailCache,
                  [chartId]: { ...cachedChart, ...updates },
                }
              : state.chartsDetailCache,
            chartsList: state.chartsList.map((c) =>
              c.id === chartId ? { ...c, ...updates } : c
            ),
          };
        });
      },

      removeChartFromCache: (chartId: string) => {
        set((state) => {
          const { [chartId]: _, ...restCache } = state.chartsDetailCache;
          return {
            chartsDetailCache: restCache,
            chartsList: state.chartsList.filter((c) => c.id !== chartId),
          };
        });
      },

      getChartFromCache: (chartId: string): ChartDetail | null => {
        return get().chartsDetailCache[chartId] || null;
      },

      // ===== UTILITY =====

      clearError: () => set({ error: null }),

      invalidateCache: () =>
        set({
          chartsList: [],
          chartsListLoaded: false,
          chartsDetailCache: {},
        }),
    }),
    { name: "ChartsStore" }
  )
);

// ===== SELECTORS =====

export const selectCurrentChart = (state: ChartsStore) =>
  state.currentChartId ? state.chartsDetailCache[state.currentChartId] : null;

export const selectChartById = (chartId: string) => (state: ChartsStore) =>
  state.chartsDetailCache[chartId] || null;

export const selectFavoriteCharts = (state: ChartsStore) =>
  state.chartsList.filter((c) => c.isFavorite);
