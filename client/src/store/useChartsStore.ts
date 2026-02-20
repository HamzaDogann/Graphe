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
  toggleFavorite: (chartId: string) => void;
  addToFavorites: (chartId: string, chartData: ChartDetail) => void;
  removeFromFavorites: (chartId: string) => void;
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
          // Only fetch favorite charts
          const response = await fetch("/api/charts?favorites=true");
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

      toggleFavorite: (chartId: string): void => {
        const { chartsList, chartsDetailCache } = get();
        const cachedChart = chartsDetailCache[chartId];
        const listChart = chartsList.find((c) => c.id === chartId);
        const chart = cachedChart || listChart;

        if (!chart) return;

        const newFavorite = !chart.isFavorite;

        // Optimistic update - immediately add/remove from list
        set((state) => {
          let newChartsList: typeof state.chartsList;
          
          if (newFavorite) {
            // Adding to favorites - add to list if not exists
            if (!state.chartsList.some((c) => c.id === chartId)) {
              const chartSummary = cachedChart ? {
                id: cachedChart.id,
                type: cachedChart.type,
                title: cachedChart.title,
                description: cachedChart.description,
                datasetName: cachedChart.datasetName,
                datasetExtension: cachedChart.datasetExtension,
                thumbnail: cachedChart.thumbnail,
                isFavorite: true,
                createdAt: cachedChart.createdAt,
                updatedAt: cachedChart.updatedAt,
              } : { ...listChart!, isFavorite: true };
              newChartsList = [chartSummary, ...state.chartsList];
            } else {
              newChartsList = state.chartsList.map((c) =>
                c.id === chartId ? { ...c, isFavorite: true } : c
              );
            }
          } else {
            // Removing from favorites - remove from list
            newChartsList = state.chartsList.filter((c) => c.id !== chartId);
          }

          // Update detail cache
          const newDetailCache = cachedChart
            ? {
                ...state.chartsDetailCache,
                [chartId]: { ...cachedChart, isFavorite: newFavorite },
              }
            : state.chartsDetailCache;

          return {
            chartsList: newChartsList,
            chartsDetailCache: newDetailCache,
          };
        });

        // Fire-and-forget API call - no await, no response handling needed
        fetch(`/api/charts/${chartId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: newFavorite }),
        }).catch((error) => {
          console.error("Failed to sync favorite to DB:", error);
          // Note: We don't rollback here since optimistic UI is already applied
          // and user would be confused by a sudden revert
        });
      },

      // Add chart to favorites list (optimistic, used by chat store)
      addToFavorites: (chartId: string, chartData: ChartDetail) => {
        set((state) => {
          // Add to detail cache
          const newDetailCache = {
            ...state.chartsDetailCache,
            [chartId]: { ...chartData, isFavorite: true },
          };

          // Add to chartsList if not exists
          if (state.chartsList.some((c) => c.id === chartId)) {
            return {
              chartsDetailCache: newDetailCache,
              chartsList: state.chartsList.map((c) =>
                c.id === chartId ? { ...c, isFavorite: true } : c
              ),
            };
          }

          return {
            chartsDetailCache: newDetailCache,
            chartsList: [
              {
                id: chartData.id,
                type: chartData.type,
                title: chartData.title,
                description: chartData.description,
                datasetName: chartData.datasetName,
                datasetExtension: chartData.datasetExtension,
                thumbnail: chartData.thumbnail,
                isFavorite: true,
                createdAt: chartData.createdAt,
                updatedAt: chartData.updatedAt,
              },
              ...state.chartsList,
            ],
          };
        });
      },

      // Remove chart from favorites list (optimistic, used by chat store)
      removeFromFavorites: (chartId: string) => {
        set((state) => ({
          chartsList: state.chartsList.filter((c) => c.id !== chartId),
          chartsDetailCache: state.chartsDetailCache[chartId]
            ? {
                ...state.chartsDetailCache,
                [chartId]: { ...state.chartsDetailCache[chartId], isFavorite: false },
              }
            : state.chartsDetailCache,
        }));
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
        set((state) => {
          // Always add to detail cache
          const newDetailCache = {
            ...state.chartsDetailCache,
            [chart.id]: chart,
          };

          // Only add to chartsList if isFavorite is true and not already exists
          let newChartsList = state.chartsList;
          if (chart.isFavorite && !state.chartsList.some((c) => c.id === chart.id)) {
            newChartsList = [
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
            ];
          }

          return {
            chartsDetailCache: newDetailCache,
            chartsList: newChartsList,
          };
        });
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
