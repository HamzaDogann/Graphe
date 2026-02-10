"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./NewChartButton.module.scss";
import { useDatasetStore } from "@/store/useDatasetStore";

interface NewChartButtonProps {
  collapsed: boolean;
}

export function NewChartButton({ collapsed }: NewChartButtonProps) {
  const router = useRouter();
  const { currentFile, parsedData } = useDatasetStore();

  const handleNewChart = () => {
    // Dataset var mı kontrol et
    const hasDataset = currentFile || parsedData;

    if (hasDataset) {
      // Dataset var → Yeni chat sayfasına git (chat henüz oluşturulmadı)
      // Chat ilk mesaj gönderildiğinde lazy olarak oluşturulacak
      // NOT: setActiveChat(null) yapma - mevcut page "Chat Not Found" gösterir
      // /chats/new page'i kendi içinde temizleyecek
      router.push("/dashboard/chats/new");
    } else {
      // Dataset yok → Upload data sayfasına yönlendir
      router.push("/dashboard");
    }
  };

  return (
    <button
      className={`${styles.newChartButton} ${
        collapsed ? styles.collapsed : ""
      }`}
      onClick={handleNewChart}
    >
      {collapsed ? (
        <Plus size={20} className={styles.icon} />
      ) : (
        <span className={styles.label}>New Chart</span>
      )}
    </button>
  );
}
