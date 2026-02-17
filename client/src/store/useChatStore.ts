/**
 * Chat Store - Zustand Slice
 *
 * Global state management for chats and messages.
 * Handles API calls for persistence and provides reactive state.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Chat,
  Message,
  StoredChartData,
  ChartStyling,
  ChartDatasetInfo,
} from "@/types/chat";
import type { ChartRenderData } from "@/types/chart";
import { generateChatId } from "@/lib/generateId";
import { useChartsStore, type ChartDetail } from "./useChartsStore";

// ===== STATE TYPES =====

interface ChatState {
  // Data
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  messagesCache: Record<string, Message[]>; // Chat ID -> Messages cache
  failedChatIds: Set<string>; // Track chats that failed to load (permission denied, not found, etc.)

  // Loading states
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isSavingChart: boolean;

  // Error states
  error: string | null;
  accessDenied: boolean; // True if current chat access was denied (403)
}

interface ChatActions {
  // Chat operations
  fetchChats: () => Promise<void>;
  createLocalChat: (title?: string) => string; // Creates chat with real ID (c-xxx), returns chatId
  saveChatToDB: (chatId: string) => Promise<void>; // Fire-and-forget: save chat to DB (returns Promise for chaining)
  setActiveChat: (chatId: string | null) => void;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, title: string) => Promise<boolean>;

  // Message operations
  fetchMessages: (chatId: string) => Promise<void>;
  addLocalUserMessage: (content: string, chatId?: string) => Message | null; // Client-only
  addLocalLoadingMessage: (chatId?: string) => string;
  addLocalAssistantMessage: (
    content: string,
    chartData?: StoredChartData,
    replaceLoadingId?: string,
    targetChatId?: string
  ) => Message | null;
  updateLocalMessage: (
    tempId: string,
    updates: Partial<Message> & { chartData?: StoredChartData },
    targetChatId?: string
  ) => void;
  // Fire-and-forget DB saves (no state update on return)
  saveUserMessageToDB: (chatId: string, content: string) => void;
  saveAssistantMessageToDB: (
    chatId: string,
    content: string,
    chartData?: StoredChartData,
    localMessageId?: string
  ) => void;
  updateMessageStyling: (
    messageId: string,
    styling: Partial<ChartStyling>
  ) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;

  // Chart favorites
  toggleChartFavorite: (messageId: string) => Promise<boolean>;

  // Utility
  clearError: () => void;
  clearMessages: () => void;
  isUnsavedChat: (chatId: string | null) => boolean; // Check if chat exists in local state but not necessarily in DB

  // Helpers for chart data conversion
  convertToStoredChartData: (
    renderData: ChartRenderData,
    datasetInfo?: ChartDatasetInfo
  ) => StoredChartData;
}

type ChatStore = ChatState & ChatActions;

// ===== DEFAULT STYLING =====

export const DEFAULT_STYLING: ChartStyling = {
  colors: [
    "#5C85FF",
    "#A855F7",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
    "#8B5CF6",
  ],
  typography: {
    fontSize: 13,
    fontFamily: "Inter",
    color: "#374151",
    isBold: false,
    isItalic: false,
    isUnderline: false,
  },
};

// ===== STORE =====

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      chats: [],
      activeChatId: null,
      messages: [],
      messagesCache: {},
      failedChatIds: new Set<string>(),
      isLoadingChats: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      isSavingChart: false,
      error: null,
      accessDenied: false,

      // ===== CHAT OPERATIONS =====

      fetchChats: async () => {
        set({ isLoadingChats: true, error: null });

        try {
          const response = await fetch("/api/chats");
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch chats");
          }

          set({ chats: data.chats, isLoadingChats: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch chats";
          set({ error: message, isLoadingChats: false });
        }
      },

      // ===== CHAT CREATION =====
      
      // Check if chat is unsaved (exists locally but may not be in DB yet)
      isUnsavedChat: (chatId: string | null) => {
        if (!chatId) return false;
        // A chat is "unsaved" if it's in local state but was just created
        // We track this by checking if it's a newly created chat without messages in DB
        const chat = get().chats.find(c => c.id === chatId);
        return chat !== undefined;
      },

      // Create chat with REAL ID (c-xxx format) - no temp IDs
      createLocalChat: (title?: string): string => {
        const chatId = generateChatId(); // Generates c-{timestamp}{random}
        const newChat: Chat = {
          id: chatId,
          title: title || "New Chat",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Mevcut mesajları cache'e kaydet
        const { activeChatId: currentChatId, messages: currentMessages } = get();
        if (currentChatId && currentMessages.length > 0) {
          set((state) => ({
            messagesCache: {
              ...state.messagesCache,
              [currentChatId]: currentMessages,
            },
          }));
        }

        // Chat'i listeye ekle, aktif yap, boş mesajlarla başlat
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: chatId,
          messages: [],
          messagesCache: {
            ...state.messagesCache,
            [chatId]: [],
          },
          error: null,
        }));

        return chatId;
      },

      // Fire-and-forget: Save chat to DB (returns Promise for chaining, but no state update)
      saveChatToDB: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (!chat) {
          console.error("saveChatToDB: Chat not found", chatId);
          return Promise.resolve();
        }

        // Return the promise for chaining, but caller doesn't need to await
        return fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: chatId, // Send the client-generated ID
            title: chat.title,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const data = await response.json();
              console.error("Failed to save chat:", data.error);
            }
            // Success - don't update state, client already has the chat
          })
          .catch((error) => {
            console.error("Failed to save chat:", error);
          });
      },

      setActiveChat: (chatId: string | null) => {
        const { messagesCache, activeChatId: currentChatId, messages: currentMessages, failedChatIds } = get();
        
        // Daha önce başarısız olan chat'e tekrar istek atma
        if (chatId && failedChatIds.has(chatId)) {
          set({ 
            activeChatId: chatId, 
            messages: [], 
            isLoadingMessages: false,
            accessDenied: true 
          });
          return;
        }
        
        // Reset accessDenied when switching chats
        set({ accessDenied: false });
        
        // Mevcut chat'in mesajlarını cache'e kaydet (geri döndüğünde kullanılacak)
        if (currentChatId && currentMessages.length > 0) {
          set((state) => ({
            messagesCache: {
              ...state.messagesCache,
              [currentChatId]: currentMessages,
            },
          }));
        }
        
        // Önce cache kontrol et
        if (chatId && messagesCache[chatId]) {
          // Cache'de var - chartsDetailCache ile senkronize et
          const chartsStore = useChartsStore.getState();
          const { chartsDetailCache } = chartsStore;
          
          // Mesajlardaki chartData'ları güncel chartsDetailCache'den güncelle
          const syncedMessages = messagesCache[chatId].map((msg) => {
            if (msg.chartId && msg.chartData && chartsDetailCache[msg.chartId]) {
              const cachedChart = chartsDetailCache[msg.chartId];
              return {
                ...msg,
                chartData: {
                  ...msg.chartData,
                  styling: cachedChart.styling,
                },
                isFavorite: cachedChart.isFavorite,
              };
            }
            return msg;
          });
          
          set({ 
            activeChatId: chatId, 
            messages: syncedMessages,
            isLoadingMessages: false 
          });
        } else {
          // Cache'de yok - loading state ile başlat (flash önleme)
          set({ activeChatId: chatId, messages: [], isLoadingMessages: !!chatId });
          if (chatId) {
            get().fetchMessages(chatId);
          }
        }
      },

      deleteChat: async (chatId: string) => {
        // Optimistic update - önce client'ta sil
        const previousChats = get().chats;
        const previousActiveChatId = get().activeChatId;
        const previousMessages = get().messages;
        const previousCache = get().messagesCache;

        set((state) => {
          // Cache'den de sil
          const { [chatId]: _, ...restCache } = state.messagesCache;
          return {
            chats: state.chats.filter((c) => c.id !== chatId),
            activeChatId:
              state.activeChatId === chatId ? null : state.activeChatId,
            messages: state.activeChatId === chatId ? [] : state.messages,
            messagesCache: restCache,
          };
        });

        try {
          const response = await fetch(`/api/chats/${chatId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete chat");
          }

          return true;
        } catch (error) {
          // Hata olursa geri al
          set({
            chats: previousChats,
            activeChatId: previousActiveChatId,
            messages: previousMessages,
            messagesCache: previousCache,
          });
          const message =
            error instanceof Error ? error.message : "Failed to delete chat";
          set({ error: message });
          return false;
        }
      },

      updateChatTitle: async (chatId: string, title: string) => {
        // Optimistic update - önce client'ta güncelle
        const previousChats = get().chats;
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, title } : c
          ),
        }));

        try {
          const response = await fetch(`/api/chats/${chatId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to update chat title");
          }

          return true;
        } catch (error) {
          // Hata olursa geri al
          set({ chats: previousChats });
          const message =
            error instanceof Error ? error.message : "Failed to update chat";
          set({ error: message });
          return false;
        }
      },

      // ===== MESSAGE OPERATIONS =====

      fetchMessages: async (chatId: string) => {
        // Skip if already failed
        if (get().failedChatIds.has(chatId)) {
          set({ accessDenied: true, isLoadingMessages: false });
          return;
        }
        
        set({ isLoadingMessages: true, error: null, accessDenied: false });

        try {
          const response = await fetch(`/api/chats/${chatId}`);
          const data = await response.json();

          if (!response.ok) {
            // Check for permission denied (403 Forbidden)
            if (response.status === 403) {
              set((state) => ({
                failedChatIds: new Set([...state.failedChatIds, chatId]),
                accessDenied: true,
                isLoadingMessages: false,
                error: "You don't have permission to view this chat",
              }));
              return;
            }
            // Chat not found (404)
            if (response.status === 404) {
              set((state) => ({
                failedChatIds: new Set([...state.failedChatIds, chatId]),
                isLoadingMessages: false,
                error: data.error || "Chat not found",
              }));
              return;
            }
            throw new Error(data.error || "Failed to fetch messages");
          }

          const fetchedMessages = data.chat.messages || [];

          // Get charts store state to check for cached data
          const chartsStore = useChartsStore.getState();
          const { chartsDetailCache } = chartsStore;

          // Transform messages: convert chart relation to chartData format
          // Use cached chart data from chartsStore if available (more up-to-date)
          const transformedMessages = fetchedMessages.map((msg: any) => {
            if (msg.chart) {
              const chartId = msg.chart.id;
              const cachedChart = chartsDetailCache[chartId];

              // Use cached data if available (has latest styling changes)
              const chartSource = cachedChart || msg.chart;

              // Convert Chart record to StoredChartData format
              const chartData: StoredChartData = {
                type: chartSource.type,
                title: chartSource.title,
                description: chartSource.description || undefined,
                createdAt: chartSource.createdAt,
                datasetInfo: chartSource.datasetName
                  ? {
                      name: chartSource.datasetName,
                      extension: chartSource.datasetExtension || "",
                    }
                  : undefined,
                data: chartSource.data,
                config: chartSource.config,
                styling: chartSource.styling,
                tableData: chartSource.tableData || undefined,
              };
              return {
                ...msg,
                chartId: chartId,
                chartData,
                isFavorite: chartSource.isFavorite || false,
                chart: undefined, // Remove nested chart object
              };
            }
            return msg;
          });

          // Sadece hala aynı chat aktifse güncelle (race condition önleme)
          const { activeChatId } = get();
          if (activeChatId === chatId) {
            set({
              messages: transformedMessages,
              isLoadingMessages: false,
            });
          }

          // Her durumda cache'e yaz
          set((state) => ({
            messagesCache: {
              ...state.messagesCache,
              [chatId]: transformedMessages,
            },
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch messages";
          set({ error: message, isLoadingMessages: false });
        }
      },

      // Add user message locally only (for lazy chat creation)
      addLocalUserMessage: (content: string, targetChatId?: string): Message | null => {
        const chatId = targetChatId || get().activeChatId;

        if (!chatId) {
          set({ error: "No active chat" });
          return null;
        }

        const tempId = `temp-user-${Date.now()}`;
        const tempMessage: Message = {
          id: tempId,
          chatId: chatId,
          role: "user",
          content,
          createdAt: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, tempMessage],
          messagesCache: {
            ...state.messagesCache,
            [chatId]: [...(state.messagesCache[chatId] || []), tempMessage],
          },
          error: null,
        }));

        return tempMessage;
      },

      addLocalLoadingMessage: (chatId?: string) => {
        const tempId = `temp-loading-${Date.now()}`;
        const targetChatId = chatId || get().activeChatId;

        if (!targetChatId) return tempId;

        const loadingMessage: Message = {
          id: tempId,
          chatId: targetChatId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedMessages = [...state.messages, loadingMessage];
          return {
            messages: updatedMessages,
            messagesCache: {
              ...state.messagesCache,
              [targetChatId]: updatedMessages,
            },
          };
        });

        return tempId;
      },

      updateLocalMessage: (tempId: string, updates: Partial<Message> & { chartData?: StoredChartData }, targetChatId?: string) => {
        const chatId = targetChatId || get().activeChatId;
        set((state) => {
          const updatedMessages = state.messages.map((msg) =>
            msg.id === tempId ? { ...msg, ...updates } : msg
          );
          // Also update cache
          if (chatId) {
            return {
              messages: updatedMessages,
              messagesCache: {
                ...state.messagesCache,
                [chatId]: updatedMessages,
              },
            };
          }
          return { messages: updatedMessages };
        });
      },

      // ===== NEW OPTIMIZED FUNCTIONS =====

      // Add assistant message locally (instant, no DB)
      addLocalAssistantMessage: (
        content: string,
        chartData?: StoredChartData,
        replaceLoadingId?: string,
        targetChatId?: string // Optional: use this instead of activeChatId
      ): Message | null => {
        const chatId = targetChatId || get().activeChatId;

        if (!chatId) {
          set({ error: "No active chat" });
          return null;
        }

        // Always generate new ID (don't keep loading ID)
        const newMessage: Message = {
          id: `assistant-${Date.now()}`,
          chatId: chatId,
          role: "assistant",
          content,
          chartData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => {
          let updatedMessages: Message[];

          if (replaceLoadingId) {
            // Replace loading message
            updatedMessages = state.messages.map((msg) =>
              msg.id === replaceLoadingId ? newMessage : msg
            );
          } else {
            // Add new message
            updatedMessages = [...state.messages, newMessage];
          }

          return {
            messages: updatedMessages,
            messagesCache: {
              ...state.messagesCache,
              [chatId]: updatedMessages,
            },
          };
        });

        return newMessage;
      },

      // Fire-and-forget: Save user message to DB (no state update on return)
      saveUserMessageToDB: (chatId: string, content: string) => {
        // Don't await - fire and forget
        fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const data = await response.json();
              console.error("Failed to save user message:", data.error);
            }
            // Success - don't update state, client already has the message
          })
          .catch((error) => {
            console.error("Failed to save user message:", error);
          });
      },

      // Fire-and-forget: Save assistant message to DB (no state update on return)
      // API creates Chart record if chartData exists and returns chartId
      saveAssistantMessageToDB: (
        chatId: string,
        content: string,
        chartData?: StoredChartData,
        localMessageId?: string // Local message ID to update with chartId
      ) => {
        // Don't await - fire and forget
        fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content, chartData }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const data = await response.json();
              console.error("Failed to save assistant message:", data.error);
              return;
            }
            
            // If chartData was provided, API created a Chart record
            // Update local message with chartId
            const data = await response.json();
            if (data.chartId && localMessageId && chartData) {
              // Update message with chartId
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === localMessageId && m.role === "assistant"
                    ? { ...m, chartId: data.chartId, isFavorite: false }
                    : m
                ),
              }));

              // Immediately add to chartsStore cache for optimistic UI
              const chartDetail: ChartDetail = {
                id: data.chartId,
                type: chartData.type,
                title: chartData.title,
                description: chartData.description || null,
                datasetName: chartData.datasetInfo?.name || null,
                datasetExtension: chartData.datasetInfo?.extension || null,
                thumbnail: null,
                isFavorite: false,
                createdAt: chartData.createdAt || new Date().toISOString(),
                updatedAt: chartData.createdAt || new Date().toISOString(),
                data: chartData.data,
                config: chartData.config,
                styling: chartData.styling,
                tableData: chartData.tableData || null,
              };
              useChartsStore.getState().addChartToCache(chartDetail);
            }
          })
          .catch((error) => {
            console.error("Failed to save assistant message:", error);
          });
      },

      updateMessageStyling: async (
        messageId: string,
        styling: Partial<ChartStyling>
      ) => {
        const { activeChatId, messages } = get();

        if (!activeChatId) return false;

        // Find the message to get chartId
        const message = messages.find((m) => m.id === messageId);
        if (!message || message.role !== "assistant") return false;

        // Helper: Mesajları styling ile güncelle
        const updateMessages = (msgs: Message[]) =>
          msgs.map((msg) =>
            msg.id === messageId && msg.role === "assistant" && msg.chartData
              ? {
                  ...msg,
                  chartData: {
                    ...msg.chartData,
                    styling: { ...msg.chartData.styling, ...styling },
                  },
                }
              : msg
          );

        // Optimistic update - messages VE cache'i aynı anda güncelle
        set((state) => {
          const updatedMessages = updateMessages(state.messages);
          return {
            messages: updatedMessages,
            messagesCache: {
              ...state.messagesCache,
              [activeChatId]: updatedMessages,
            },
            isSavingChart: true,
          };
        });

        try {
          // If message has chartId, update via Chart API (not Message API)
          if (message.chartId) {
            const response = await fetch(`/api/charts/${message.chartId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ styling }),
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || "Failed to update styling");
            }
          }
          // If no chartId, just update local state (no DB persistence)

          set({ isSavingChart: false });

          return true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update styling";
          set({ error: message, isSavingChart: false });
          return false;
        }
      },

      deleteMessage: async (messageId: string) => {
        const { activeChatId } = get();

        if (!activeChatId) return false;

        try {
          const response = await fetch(
            `/api/chats/${activeChatId}/messages/${messageId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete message");
          }

          set((state) => ({
            messages: state.messages.filter((m) => m.id !== messageId),
          }));

          return true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to delete message";
          set({ error: message });
          return false;
        }
      },

      // ===== CHART FAVORITES =====

      toggleChartFavorite: async (messageId: string): Promise<boolean> => {
        const { messages } = get();

        // Find the message
        const message = messages.find((m) => m.id === messageId);
        if (!message || message.role !== "assistant" || !message.chartId) {
          console.warn("Cannot toggle favorite: message has no chartId");
          return false;
        }

        const currentlyFavorited = message.isFavorite || false;
        const chartId = message.chartId!;

        // Optimistic update - both message and chartsStore
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId && m.role === "assistant"
              ? { ...m, isFavorite: !currentlyFavorited, isSaving: true }
              : m
          ),
        }));
        useChartsStore.getState().updateChartInCache(chartId, {
          isFavorite: !currentlyFavorited,
        });

        try {
          // Chart already exists in DB, just toggle isFavorite
          const response = await fetch(`/api/charts/${chartId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isFavorite: !currentlyFavorited }),
          });

          if (!response.ok) {
            throw new Error("Failed to toggle favorite");
          }

          // Update message (remove isSaving flag)
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === messageId && m.role === "assistant"
                ? { ...m, isSaving: false }
                : m
            ),
          }));

          return true;
        } catch (error) {
          // Rollback on error - both message and chartsStore
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === messageId && m.role === "assistant"
                ? { ...m, isFavorite: currentlyFavorited, isSaving: false }
                : m
            ),
            error:
              error instanceof Error
                ? error.message
                : "Failed to toggle favorite",
          }));
          useChartsStore.getState().updateChartInCache(chartId, {
            isFavorite: currentlyFavorited,
          });
          return false;
        }
      },

      // ===== UTILITY =====

      clearError: () => set({ error: null }),

      clearMessages: () => set({ messages: [] }),

      /**
       * Convert ChartRenderData (from AI hook) to StoredChartData (for DB)
       * This strips unnecessary originalData and keeps only aggregated values
       */
      convertToStoredChartData: (
        renderData: ChartRenderData,
        datasetInfo?: ChartDatasetInfo
      ): StoredChartData => {
        return {
          type: renderData.type,
          title: renderData.config.title,
          description: renderData.config.description,
          createdAt: new Date().toISOString(),
          datasetInfo,
          data: renderData.processedData.map((point) => ({
            label: point.label,
            value: point.value,
            percentage: point.percentage,
          })),
          config: {
            chartType: renderData.config.chartType,
            title: renderData.config.title,
            groupBy: renderData.config.groupBy || undefined,
            operation: renderData.config.operation || undefined,
            metricColumn: renderData.config.metricColumn || undefined,
            filters: renderData.config.filters?.map((f) => ({
              column: f.column,
              operator: f.operator as
                | "eq"
                | "neq"
                | "gt"
                | "lt"
                | "gte"
                | "lte"
                | "contains",
              value: f.value,
            })),
          },
          styling: DEFAULT_STYLING,
        };
      },
    }),
    { name: "ChatStore" }
  )
);

// ===== SELECTORS =====

export const selectActiveChat = (state: ChatStore) =>
  state.chats.find((c) => c.id === state.activeChatId) || null;

export const selectHasMessages = (state: ChatStore) => state.messages.length > 0;

export const selectChartMessages = (state: ChatStore) =>
  state.messages.filter((m) => m.role === "assistant" && m.chartData);
