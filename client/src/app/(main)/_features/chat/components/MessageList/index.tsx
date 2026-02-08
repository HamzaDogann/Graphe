"use client";

import { useEffect, useRef } from "react";
import styles from "./MessageList.module.scss";

// Alt bileşenler (Folder yapına göre importlar)
import { UserMessage } from "../UserMessage";
import { SystemResponseLoading } from "../SystemResponseLoading";
import { SystemResponse } from "../SystemResponse";
import { ChartRenderData } from "@/types/chart";

// Message tipini dışarıdan erişilebilir yapıyoruz
export interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  isLoading?: boolean;
  chartData?: ChartRenderData; // AI-generated chart data
  error?: string; // Error message if generation failed
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesaj sayısı değiştiğinde en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.messageListContainer}>
      {messages.map((message) => {
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
          return (
            <SystemResponse
              key={message.id}
              title={message.chartData?.config?.title || "Response"}
              description={
                message.chartData?.config?.description || message.content
              }
              chartData={message.chartData}
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
