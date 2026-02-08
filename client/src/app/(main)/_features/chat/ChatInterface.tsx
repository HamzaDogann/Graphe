"use client";

import { useState, useEffect } from "react";
import styles from "./ChatInterface.module.scss";

// Component importları
import { DatasetBanner } from "./components/DatasetBanner";
import { HeroSection } from "./components/HeroSection";
import { SuggestionsGrid } from "./components/SuggestionsGrid";
import { ChatInput } from "./components/ChatInput";
import { DatasetModal } from "./components/DatasetModal";
import { MessageList, Message } from "./components/MessageList";

// Store ve Hook importları
import { useDatasetStore } from "@/store/useDatasetStore";
import { useFileParser } from "./hooks/useFileParser";
import { useChartGeneration } from "./hooks/useChartGeneration";

export default function ChatInterface() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // GLOBAL STATE
  const { currentFile, parsedData, isLoading, setParsedData, setIsLoading } =
    useDatasetStore();

  // Parser Hook
  const { parseFile, data: hookData, loading: hookLoading } = useFileParser();

  // Chart Generation Hook
  const { generateChart, isGenerating } = useChartGeneration();

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

  // Mesaj Gönderme - AI ile Chart Oluşturma
  const handleSendMessage = async (content: string) => {
    // 1. Kullanıcı mesajı ekle
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Sistem loading mesajı ekle
    const loadingId = `system-${Date.now()}`;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: loadingId, type: "system", content: "", isLoading: true },
      ]);
    }, 100);

    // 3. AI ile chart oluştur
    const chartData = await generateChart(content);

    // 4. Loading mesajını güncelle
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingId
          ? {
              ...msg,
              isLoading: false,
              content: chartData
                ? chartData.config.description ||
                  "Chart generated successfully."
                : "I couldn't generate a chart for your request.",
              chartData: chartData || undefined,
              error: !chartData
                ? "Failed to generate chart. Please try again."
                : undefined,
            }
          : msg,
      ),
    );
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.chatContainer}>
      <DatasetBanner
        fileName={
          currentFile ? parsedData?.fileName || currentFile?.name : "No File"
        }
        onInfoClick={handleBannerClick}
      />

      {/* Scrollable Content Area */}
      <div className={styles.scrollableContent}>
        <div className={styles.contentWrapper}>
          {!hasMessages ? (
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
        <ChatInput onSendMessage={handleSendMessage} />
      </div>

      <DatasetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
