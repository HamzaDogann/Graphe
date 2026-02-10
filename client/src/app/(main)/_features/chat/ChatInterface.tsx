"use client";

import { useState, useEffect } from "react";
import styles from "./ChatInterface.module.scss";

// Component importları
import { DatasetBanner } from "./components/DatasetBanner";
import { HeroSection } from "./components/HeroSection";
import { SuggestionsGrid } from "./components/SuggestionsGrid";
import { ChatInput } from "./components/ChatInput";
import { DatasetModal } from "./components/DatasetModal";
import { MessageList } from "./components/MessageList";
import { ProcessingLoader } from "@/app/_components";

// Store ve Hook importları
import { useDatasetStore } from "@/store/useDatasetStore";
import { useFileParser } from "./hooks/useFileParser";
import { useChat } from "./hooks/useChat";

export default function ChatInterface() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chat Hook - manages messages and API calls
  const {
    messages,
    isLoading,
    isLoadingMessages,
    isGenerating,
    sendMessage,
    hasMessages,
  } = useChat();

  // GLOBAL STATE
  const {
    currentFile,
    parsedData,
    isLoading: datasetLoading,
    setParsedData,
    setIsLoading,
  } = useDatasetStore();

  // Parser Hook
  const { parseFile, data: hookData, loading: hookLoading } = useFileParser();

  // 1. Dosya değiştiğinde parse işlemi
  useEffect(() => {
    if (currentFile && !parsedData && !hookLoading) {
      parseFile(currentFile);
    }
  }, [currentFile, parsedData, parseFile, hookLoading]);

  // 2. Hook sonucunu Store'a yazma
  useEffect(() => {
    if (hookData) {
      setParsedData(hookData);
    }
    setIsLoading(hookLoading);
  }, [hookData, hookLoading, setParsedData, setIsLoading]);

  const handleBannerClick = () => {
    setIsModalOpen(true);
  };

  // Mesaj Gönderme - useChat hook'u kullan
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className={styles.chatContainer}>
      <DatasetBanner
        fileName={parsedData?.fileName || currentFile?.name || "No File"}
        onInfoClick={handleBannerClick}
      />

      {/* Scrollable Content Area */}
      <div className={styles.scrollableContent}>
        <div className={styles.contentWrapper}>
          {/* Mesajlar yüklenirken loader göster (cache miss durumunda) */}
          {isLoadingMessages ? (
            <div className={styles.loadingContainer}>
              <ProcessingLoader />
            </div>
          ) : !hasMessages ? (
            <div className={styles.upperContent}>
              <HeroSection />
              <SuggestionsGrid />
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
        </div>
      </div>

      <div className={styles.inputArea}>
        {!isLoadingMessages && (
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isGenerating}
          />
        )}
      </div>

      <DatasetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
