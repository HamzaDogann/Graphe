"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ChatInterface.module.scss";
// Component importları...
import { DatasetBanner } from "./components/DatasetBanner";
import { HeroSection } from "./components/HeroSection";
import { SuggestionsGrid } from "./components/SuggestionsGrid";
import { ChatInput } from "./components/ChatInput";
import { DatasetModal } from "./components/DatasetModal";
import { UserMessage } from "./components/UserMessage";
import { SystemResponseLoading } from "./components/SystemResponseLoading";
import { SystemResponse } from "./components/SystemResponse";
// Store ve Hook importları
import { useDatasetStore } from "@/store/useDatasetStore";
import { useFileParser } from "./hooks/useFileParser";

// Message Types
interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  isLoading?: boolean;
}

export default function ChatInterface() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GLOBAL STATE'TEN VERİLERİ ÇEKİYORUZ
  const { file, parsedData, isLoading, setParsedData, setIsLoading } =
    useDatasetStore();

  // Parser Hook
  const { parseFile, data: hookData, loading: hookLoading } = useFileParser();

  // 1. Dosya değiştiğinde ve henüz parse edilmemişse parse et
  useEffect(() => {
    if (file && !parsedData && !hookLoading) {
      parseFile(file);
    }
  }, [file, parsedData, parseFile, hookLoading]);

  // 2. Hook'tan gelen sonucu Store'a yaz
  useEffect(() => {
    if (hookData) {
      setParsedData(hookData);
    }
    setIsLoading(hookLoading);
  }, [hookData, hookLoading, setParsedData, setIsLoading]);

  // Auto scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBannerClick = () => {
    setIsModalOpen(true);
  };

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    // 1. Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Add loading state for system
    const loadingId = `system-${Date.now()}`;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: loadingId, type: "system", content: "", isLoading: true },
      ]);
    }, 300);

    // 3. Simulate response after 2 seconds
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                isLoading: false,
                content:
                  "I've created a pie chart based on your data. The chart visualizes the distribution of customer segments across different regions, showing the percentage breakdown for each category.",
              }
            : msg,
        ),
      );
    }, 2300);
  };

  // Check if conversation has started
  const hasMessages = messages.length > 0;

  return (
    <div className={styles.chatContainer}>
      <DatasetBanner
        fileName={file ? file.name : "No File"}
        onInfoClick={handleBannerClick}
      />

      {/* Scrollable Content Area */}
      <div className={styles.scrollableContent}>
        <div className={styles.contentWrapper}>
          {/* Initial State - Hero & Suggestions */}
          {!hasMessages && (
            <div className={styles.upperContent}>
              <HeroSection />
              <SuggestionsGrid />
            </div>
          )}

          {/* Messages Area */}
          {hasMessages && (
            <div className={styles.messagesArea}>
              {messages.map((message) => {
                if (message.type === "user") {
                  return (
                    <UserMessage key={message.id} content={message.content} />
                  );
                }
                if (message.type === "system" && message.isLoading) {
                  return <SystemResponseLoading key={message.id} />;
                }
                if (message.type === "system" && !message.isLoading) {
                  return (
                    <SystemResponse
                      key={message.id}
                      title="Generated Chart"
                      description={message.content}
                    />
                  );
                }
                return null;
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area */}
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
