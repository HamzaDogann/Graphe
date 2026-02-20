"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./MessageList.module.scss";

// Alt bileşenler (Folder yapına göre importlar)
import { UserMessage } from "../UserMessage";
import { SystemResponseLoading } from "../SystemResponseLoading";
import { SystemResponse } from "../SystemResponse";
import type { Message as StoreMessage, StoredChartData } from "@/types/chat";
import { storedToRenderData } from "@/types/chat";
import { useChatStore } from "@/store/useChatStore";

// Legacy Message type for backward compatibility
export interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  isLoading?: boolean;
  chartData?: any;
  error?: string;
}

// Props can accept either legacy Message[] or store Message[]
interface MessageListProps {
  messages: Message[] | StoreMessage[];
}

// Type guard to check if message is from store
const isStoreMessage = (msg: Message | StoreMessage): msg is StoreMessage => {
  return "role" in msg;
};

// Check if message is loading (temp message without real content)
const isLoadingMessage = (msg: StoreMessage): boolean => {
  return msg.id.startsWith("temp-loading-") && msg.role === "assistant";
};

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const prevLastMessageIdRef = useRef<string | null>(null);

  const toggleChartFavorite = useChatStore(
    (state) => state.toggleChartFavorite,
  );

  // Create stable callback for favorite toggle
  const handleToggleFavorite = useCallback(
    (messageId: string, thumbnail?: string) => {
      toggleChartFavorite(messageId, thumbnail);
    },
    [toggleChartFavorite],
  );

  // Scroll sadece yeni mesaj eklendiğinde (sayı arttığında veya son mesaj değiştiğinde)
  useEffect(() => {
    const currentCount = messages.length;
    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage
      ? isStoreMessage(lastMessage)
        ? lastMessage.id
        : lastMessage.id
      : null;

    const shouldScroll =
      currentCount > prevMessageCountRef.current ||
      (lastMessageId !== prevLastMessageIdRef.current &&
        prevLastMessageIdRef.current?.startsWith("temp-loading-"));

    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Önceki değerleri güncelle
    prevMessageCountRef.current = currentCount;
    prevLastMessageIdRef.current = lastMessageId;
  }, [messages]);

  return (
    <div className={styles.messageListContainer}>
      {messages.map((message) => {
        // Handle store messages (new format)
        if (isStoreMessage(message)) {
          // 1. Kullanıcı Mesajı
          if (message.role === "user") {
            return (
              <UserMessage key={message.id} content={message.content || ""} />
            );
          }

          // 2. Loading State (temp message)
          if (isLoadingMessage(message)) {
            return <SystemResponseLoading key={message.id} />;
          }

          // 3. Assistant Response
          if (message.role === "assistant") {
            const chartData = message.chartData as StoredChartData | undefined;
            const renderData = chartData
              ? storedToRenderData(chartData)
              : undefined;

            return (
              <SystemResponse
                key={message.id}
                messageId={message.id}
                title={chartData?.title || "Response"}
                description={message.content || chartData?.title}
                chartData={renderData}
                storedChartData={chartData}
                chartId={message.chartId}
                isFavorite={message.isFavorite}
                isSaving={message.isSaving}
                onToggleFavorite={(thumbnail) =>
                  handleToggleFavorite(message.id, thumbnail)
                }
              />
            );
          }

          return null;
        }

        // Handle legacy messages (old format) - backward compatibility
        // 1. Kullanıcı Mesajı
        if (message.type === "user") {
          return <UserMessage key={message.id} content={message.content} />;
        }

        // 2. Sistem Yükleniyor Mesajı
        if (message.type === "system" && message.isLoading) {
          return <SystemResponseLoading key={message.id} />;
        }

        // 3. Sistem Yanıtı (Chart veya Error)
        if (message.type === "system" && !message.isLoading) {
          const chartData = message.chartData as StoredChartData | undefined;
          return (
            <SystemResponse
              key={message.id}
              title={chartData?.config?.title || "Response"}
              description={chartData?.config?.description || message.content}
              chartData={message.chartData}
              storedChartData={chartData}
              error={message.error}
            />
          );
        }

        return null;
      })}

      {/* Scroll hedefi (Listenin en sonu) */}
      <div ref={messagesEndRef} />
    </div>
  );
};
