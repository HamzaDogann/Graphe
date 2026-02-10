/**
 * useChat Hook
 * 
 * Combines useChatStore with useChartGeneration for a complete chat experience.
 * Implements lazy chat creation - chat is only created when first message is sent.
 * All operations are optimistic - UI updates instantly, DB syncs in background.
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
  isLoadingMessages: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;

  // Chat info
  activeChatId: string | null;
  hasMessages: boolean;
  isNewChat: boolean; // URL'de chatId yok (yeni chat bekliyor)
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
    createLocalChat,
    addLocalUserMessage,
    addLocalLoadingMessage,
    addLocalAssistantMessage,
    updateLocalMessage,
    saveChatToDB,
    saveUserMessageToDB,
    saveAssistantMessageToDB,
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

  // Set active chat when URL changes (only for existing chats)
  useEffect(() => {
    if (chatId && chatId !== activeChatId && chatId !== "new") {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  // Chat geçişi sırasında loading göster (flash önleme)
  const isTransitioning = !!(chatId && chatId !== "new" && chatId !== activeChatId);

  // URL'deki chatId ile activeChatId eşleşmiyorsa mesajları gösterme
  const safeMessages = isTransitioning ? [] : messages;

  // Combined error
  const error = storeError || chartError;

  // Clear all errors
  const clearError = useCallback(() => {
    storeClearError();
    clearChartError();
  }, [storeClearError, clearChartError]);

 
  const sendMessage = useCallback(
    async (content: string) => {
      let currentChatId = activeChatId;
      const isNewChat = !currentChatId;

      // ===== NEW CHAT FLOW =====
      if (isNewChat) {
        // Step 1: Create local chat with REAL ID (c-xxx format, not temp)
        currentChatId = createLocalChat();

        // Step 2: Update URL with real ID immediately (no re-render)
        window.history.replaceState(
          window.history.state,
          '',
          `/dashboard/chats/${currentChatId}`
        );

        // Step 3: Add local user message
        const userMessage = addLocalUserMessage(content, currentChatId!);
        if (!userMessage) return;

        // Step 4: Add loading message
        const loadingId = addLocalLoadingMessage(currentChatId!);

        // Step 5: Fire-and-forget - save chat first, then user message (must be sequential)
        saveChatToDB(currentChatId!).then(() => {
          saveUserMessageToDB(currentChatId!, content);
        });

        // Step 6: Generate chart with AI
        const { data: chartData, error: genError } = await generateChart(content);

        // Step 7: Prepare assistant response
        let storedChartData: StoredChartData | undefined;
        let responseContent: string;

        if (chartData) {
          storedChartData = convertToStoredChartData(chartData);
          responseContent = chartData.config.description || "Chart generated successfully.";
        } else {
          responseContent = genError || "I couldn't generate a chart for your request. Please try again.";
        }

        // Step 8: Update loading message to assistant message locally (INSTANT)
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`, // New ID to stop loading animation
          chatId: currentChatId!,
          role: "assistant",
          content: responseContent,
          chartData: storedChartData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updateLocalMessage(loadingId, assistantMessage, currentChatId!);

        // Step 9: Fire-and-forget - save assistant message to DB
        saveAssistantMessageToDB(currentChatId!, responseContent, storedChartData);

        return;
      }

      // ===== EXISTING CHAT FLOW (OPTIMIZED) =====
      // All operations are instant on client, DB syncs in background
      
      // Step 1: Add local user message (instant)
      const userMessage = addLocalUserMessage(content, currentChatId!);
      if (!userMessage) return;

      // Step 2: Add loading message (instant - this shows AI loading animation)
      const loadingId = addLocalLoadingMessage(currentChatId!);

      // Step 3: Fire-and-forget - save user message to DB
      saveUserMessageToDB(currentChatId!, content);

      // Step 4: Generate chart with AI
      const { data: chartData, error: genError } = await generateChart(content);

      // Step 5: Prepare response
      let storedChartData: StoredChartData | undefined;
      let responseContent: string;

      if (chartData) {
        storedChartData = convertToStoredChartData(chartData);
        responseContent = chartData.config.description || "Chart generated successfully.";
      } else {
        responseContent = genError || "I couldn't generate a chart for your request. Please try again.";
      }

      // Step 6: Update loading message to assistant message locally (instant)
      addLocalAssistantMessage(responseContent, storedChartData, loadingId, currentChatId!);

      // Step 7: Fire-and-forget - save assistant message to DB
      saveAssistantMessageToDB(currentChatId!, responseContent, storedChartData);
    },
    [
      activeChatId,
      createLocalChat,
      addLocalUserMessage,
      addLocalLoadingMessage,
      addLocalAssistantMessage,
      updateLocalMessage,
      generateChart,
      convertToStoredChartData,
      saveChatToDB,
      saveUserMessageToDB,
      saveAssistantMessageToDB,
    ]
  );

  return {
    messages: safeMessages,
    isLoading: isLoadingMessages || isSendingMessage || isTransitioning,
    isLoadingMessages: isLoadingMessages || isTransitioning, // Geçiş sırasında da loading göster
    isGenerating,
    error,
    sendMessage,
    clearError,
    activeChatId,
    hasMessages: safeMessages.length > 0,
    isNewChat: !chatId || chatId === "new",
  };
};
