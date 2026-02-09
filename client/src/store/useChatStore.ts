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
} from "@/types/chat";
import type { ChartRenderData } from "@/types/chart";

// ===== STATE TYPES =====

interface ChatState {
  // Data
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];

  // Loading states
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isSavingChart: boolean;

  // Error states
  error: string | null;
}

interface ChatActions {
  // Chat operations
  fetchChats: () => Promise<void>;
  createChat: (title?: string) => Promise<Chat | null>;
  setActiveChat: (chatId: string | null) => void;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, title: string) => Promise<boolean>;

  // Message operations
  fetchMessages: (chatId: string) => Promise<void>;
  addUserMessage: (content: string) => Promise<Message | null>;
  addAssistantMessage: (
    content: string,
    chartData?: StoredChartData,
    replaceLoadingId?: string
  ) => Promise<Message | null>;
  addLocalLoadingMessage: () => string;
  updateLocalMessage: (
    tempId: string,
    updates: Partial<Message> & { chartData?: StoredChartData }
  ) => void;
  updateMessageStyling: (
    messageId: string,
    styling: Partial<ChartStyling>
  ) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;

  // Utility
  clearError: () => void;
  clearMessages: () => void;

  // Helpers for chart data conversion
  convertToStoredChartData: (renderData: ChartRenderData) => StoredChartData;
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
      isLoadingChats: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      isSavingChart: false,
      error: null,

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

      createChat: async (title?: string) => {
        set({ error: null });

        try {
          const response = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to create chat");
          }

          const newChat = data.chat as Chat;

          // Add to chats list
          set((state) => ({
            chats: [newChat, ...state.chats],
            activeChatId: newChat.id,
            messages: [],
          }));

          return newChat;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to create chat";
          set({ error: message });
          return null;
        }
      },

      setActiveChat: (chatId: string | null) => {
        set({ activeChatId: chatId, messages: [] });

        if (chatId) {
          get().fetchMessages(chatId);
        }
      },

      deleteChat: async (chatId: string) => {
        try {
          const response = await fetch(`/api/chats/${chatId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to delete chat");
          }

          set((state) => ({
            chats: state.chats.filter((c) => c.id !== chatId),
            activeChatId:
              state.activeChatId === chatId ? null : state.activeChatId,
            messages: state.activeChatId === chatId ? [] : state.messages,
          }));

          return true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to delete chat";
          set({ error: message });
          return false;
        }
      },

      updateChatTitle: async (chatId: string, title: string) => {
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

          set((state) => ({
            chats: state.chats.map((c) =>
              c.id === chatId ? { ...c, title } : c
            ),
          }));

          return true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update chat";
          set({ error: message });
          return false;
        }
      },

      // ===== MESSAGE OPERATIONS =====

      fetchMessages: async (chatId: string) => {
        set({ isLoadingMessages: true, error: null });

        try {
          const response = await fetch(`/api/chats/${chatId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch messages");
          }

          set({
            messages: data.chat.messages || [],
            isLoadingMessages: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch messages";
          set({ error: message, isLoadingMessages: false });
        }
      },

      addUserMessage: async (content: string) => {
        const { activeChatId } = get();

        if (!activeChatId) {
          set({ error: "No active chat" });
          return null;
        }

        set({ isSendingMessage: true, error: null });

        try {
          const response = await fetch(`/api/chats/${activeChatId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "user",
              content,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to add message");
          }

          const newMessage = data.message as Message;

          set((state) => ({
            messages: [...state.messages, newMessage],
            isSendingMessage: false,
          }));

          // Update chat title if it changed
          if (data.chatTitle) {
            set((state) => ({
              chats: state.chats.map((c) =>
                c.id === activeChatId ? { ...c, title: data.chatTitle } : c
              ),
            }));
          }

          return newMessage;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to add message";
          set({ error: message, isSendingMessage: false });
          return null;
        }
      },

      addLocalLoadingMessage: () => {
        const tempId = `temp-loading-${Date.now()}`;
        const { activeChatId } = get();

        if (!activeChatId) return tempId;

        const loadingMessage: Message = {
          id: tempId,
          chatId: activeChatId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, loadingMessage],
        }));

        return tempId;
      },

      updateLocalMessage: (tempId: string, updates: Partial<Message> & { chartData?: StoredChartData }) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === tempId ? { ...msg, ...updates } : msg
          ),
        }));
      },

      addAssistantMessage: async (
        content: string,
        chartData?: StoredChartData,
        replaceLoadingId?: string // Optional: replace loading message instead of adding new
      ) => {
        const { activeChatId } = get();

        if (!activeChatId) {
          set({ error: "No active chat" });
          return null;
        }

        set({ isSendingMessage: true, error: null });

        try {
          const response = await fetch(`/api/chats/${activeChatId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "assistant",
              content,
              chartData,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to add message");
          }

          const newMessage = data.message as Message;

          // If replaceLoadingId provided, replace that message; otherwise add new
          if (replaceLoadingId) {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === replaceLoadingId ? newMessage : msg
              ),
              isSendingMessage: false,
            }));
          } else {
            set((state) => ({
              messages: [...state.messages, newMessage],
              isSendingMessage: false,
            }));
          }

          return newMessage;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to add message";
          set({ error: message, isSendingMessage: false });
          return null;
        }
      },

      updateMessageStyling: async (
        messageId: string,
        styling: Partial<ChartStyling>
      ) => {
        const { activeChatId, messages } = get();

        if (!activeChatId) return false;

        set({ isSavingChart: true });

        try {
          const response = await fetch(
            `/api/chats/${activeChatId}/messages/${messageId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chartData: { styling },
              }),
            }
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to update styling");
          }

          // Update local state
          set({
            messages: messages.map((msg) =>
              msg.id === messageId && msg.role === "assistant" && msg.chartData
                ? {
                    ...msg,
                    chartData: {
                      ...msg.chartData,
                      styling: { ...msg.chartData.styling, ...styling },
                    },
                  }
                : msg
            ),
            isSavingChart: false,
          });

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

      // ===== UTILITY =====

      clearError: () => set({ error: null }),

      clearMessages: () => set({ messages: [] }),

      /**
       * Convert ChartRenderData (from AI hook) to StoredChartData (for DB)
       * This strips unnecessary originalData and keeps only aggregated values
       */
      convertToStoredChartData: (
        renderData: ChartRenderData
      ): StoredChartData => {
        return {
          type: renderData.type,
          title: renderData.config.title,
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
