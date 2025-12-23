"use client";

import { useState, useEffect } from "react";
import styles from "./ChatInterface.module.scss";
// Component importları...
import { DatasetBanner } from "./components/DatasetBanner";
import { HeroSection } from "./components/HeroSection";
import { SuggestionsGrid } from "./components/SuggestionsGrid";
import { ChatInput } from "./components/ChatInput";
import { DatasetModal } from "./components/DatasetModal";
// Store ve Hook importları
import { useDatasetStore } from "@/store/useDatasetStore";
import { useFileParser } from "./hooks/useFileParser";

// Props interface silindi

export default function ChatInterface() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleBannerClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={styles.chatContainer}>
      {/* Prop geçmeye gerek yok, Banner kendi içinde Store'dan alabilir ama
          şimdilik prop olarak store verisini verelim, daha sonra onu da bağlarız */}
      <DatasetBanner
        fileName={file ? file.name : "No File"}
        onInfoClick={handleBannerClick}
      />

      <div className={styles.contentWrapper}>
        <div className={styles.upperContent}>
          <HeroSection />
          <SuggestionsGrid />
        </div>
        <ChatInput />
      </div>

      <DatasetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // Verileri artık store yönetiyor, modal içinde store'a bağlayacağız
      />
    </div>
  );
}
