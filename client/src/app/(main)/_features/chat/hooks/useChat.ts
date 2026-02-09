/**
 * useChat Hook
 * 
 * Combines useChatStore with useChartGeneration for a complete chat experience.
 * This hook manages the chat flow: send message → generate chart → save to DB.
 */

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { useChartGeneration } from "./useChartGeneration";
import type { StoredChartData, Message } from "@/types/chat";

interface UseChatReturn {
  // State
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;

  // Chat info
  activeChatId: string | null;
  hasMessages: boolean;
}

export const useChat = (): UseChatReturn => {
  const params = useParams();
  const chatId = params?.chatId as string | undefined;

  // Store state and actions
  const {
    messages,
    activeChatId,
    isLoadingMessages,
    isSendingMessage,
    error: storeError,
    setActiveChat,
    createChat,
    addUserMessage,
    addLocalLoadingMessage,
    addAssistantMessage,
    clearError: storeClearError,
    convertToStoredChartData,
  } = useChatStore();

  // Chart generation hook
  const {
    generateChart,
    isGenerating,
    error: chartError,
    clearError: clearChartError,
  } = useChartGeneration();

  // Set active chat when URL changes
  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  // Combined error
  const error = storeError || chartError;

  // Clear all errors
  const clearError = useCallback(() => {
    storeClearError();
    clearChartError();
  }, [storeClearError, clearChartError]);

  /**
   * Main message sending flow:
   * 1. Create chat if needed
   * 2. Add user message to DB
   * 3. Show loading state
   * 4. Generate chart with AI
   * 5. Save assistant response to DB
   */
  const sendMessage = useCallback(
    async (content: string) => {
      let currentChatId = activeChatId;

      // 1. Create chat if needed
      if (!currentChatId) {
        const newChat = await createChat();
        if (!newChat) return;
        currentChatId = newChat.id;
      }

      // 2. Add user message to DB
      const userMessage = await addUserMessage(content);
      if (!userMessage) return;

      // 3. Add loading message locally
      const loadingId = addLocalLoadingMessage();

      // 4. Generate chart with AI
      const chartData = await generateChart(content);

      // 5. Prepare response
      let storedChartData: StoredChartData | undefined;
      let responseContent: string;

      if (chartData) {
        storedChartData = convertToStoredChartData(chartData);
        responseContent =
          chartData.config.description || "Chart generated successfully.";
      } else {
        responseContent =
          "I couldn't generate a chart for your request. Please try again with a different prompt.";
      }

      // 6. Save to database and replace loading message in one step
      await addAssistantMessage(
        responseContent,
        storedChartData,
        loadingId // Replace loading message with saved one
      );
    },
    [
      activeChatId,
      createChat,
      addUserMessage,
      addLocalLoadingMessage,
      generateChart,
      convertToStoredChartData,
      addAssistantMessage,
    ]
  );

  return {
    messages,
    isLoading: isLoadingMessages || isSendingMessage,
    isGenerating,
    error,
    sendMessage,
    clearError,
    activeChatId,
    hasMessages: messages.length > 0,
  };
};
