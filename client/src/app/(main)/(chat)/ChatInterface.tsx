"use client";

import { useEffect, useState, useRef } from "react";
import {
  Database,
  LineChart,
  Table2,
  PieChart,
  Gauge,
  BarChart3,
  Network,
  Mic,
  ArrowUp,
} from "lucide-react";
import styles from "./ChatInterface.module.scss";

interface ChatInterfaceProps {
  uploadedFile: File | null;
}

// 1. Prompt Verileri ve Renkleri
const PROMPTS = [
  {
    text: 'Generate a pie chart based on the distribution of "column-name-here"',
    bgColor: "#fff7ed",
    textColor: "#f97316",
  },
  {
    text: 'Generate a bar chart with values grouped by "field-name-here"',
    bgColor: "#E5EFFF",
    textColor: "#5C85FF",
  },
  {
    text: 'Generate a line chart showing the trend of "your-column-here" over time.',
    bgColor: "#D7FFF6",
    textColor: "#2FA456",
  },
];

const suggestionItems = [
  { icon: LineChart, className: styles.bgBlue },
  { icon: Table2, className: styles.bgOrange },
  { icon: PieChart, className: styles.bgGreen },
  { icon: Gauge, className: styles.bgLime },
  { icon: BarChart3, className: styles.bgPurple },
  { icon: Network, className: styles.bgRed },
];

export default function ChatInterface({ uploadedFile }: ChatInterfaceProps) {
  // Input Border Animasyonu State'i
  const [isAnimating, setIsAnimating] = useState(true);

  // Prompt Döngüsü State'i
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Input Değeri State'i (YENİ)
  const [inputValue, setInputValue] = useState("");

  // Input Referansı (Focuslanmak için - YENİ)
  const inputRef = useRef<HTMLInputElement>(null);

  // Input Border Animasyon Zamanlayıcısı
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  // Prompt Değiştirme Zamanlayıcısı (3.5 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentPrompt = PROMPTS[currentPromptIndex];

  // Prompt'a tıklandığında çalışacak fonksiyon (YENİ)
  const handlePromptClick = () => {
    setInputValue(currentPrompt.text); // Metni inputa yaz
    inputRef.current?.focus(); // Inputa odaklan
  };

  return (
    <div className={styles.chatContainer}>
      {/* Dataset Banner */}
      <div className={styles.datasetBanner}>
        <div className={styles.fileInfo}>
          <div className={styles.dbIconWrapper}>
            <Database size={22} />
          </div>

          <div className={styles.fileText}>
            <span className={styles.fileLabel}>Dataset</span>
            <span className={styles.fileName}>
              {uploadedFile ? uploadedFile.name : "file.csv"}
            </span>
          </div>
        </div>

        <div className={styles.canvasBtnWrapper}>
          <img
            src="/canvasbutton/graphs.svg"
            alt="graphs"
            className={`${styles.canvasSideIcon} ${styles.canvasLeftIcon}`}
            loading="lazy"
          />

          <button className={styles.canvasBtn}>Create Canvas</button>

          <img
            src="/canvasbutton/easel.svg"
            alt="easel"
            className={`${styles.canvasSideIcon} ${styles.canvasRightIcon}`}
            loading="lazy"
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Generate Chart with Graphe</h1>
          <p className={styles.heroSubtitle}>
            Just type one prompt to instantly create charts from your data.
          </p>
        </div>

        {/* Suggestions Grid */}
        <div className={styles.suggestionsGrid}>
          {suggestionItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`${styles.suggestionCard} ${item.className}`}
              >
                <Icon size={28} />
              </div>
            );
          })}
        </div>

        <div
          className={`${styles.inputBorderWrapper} ${
            isAnimating ? styles.animating : styles.static
          }`}
        >
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef} 
              type="text"
              placeholder="Ask anything..."
              className={styles.inputField}
              autoFocus
              value={inputValue} // State'e bağladık
              onChange={(e) => setInputValue(e.target.value)}
            />

            <div className={styles.inputFooter}>
              <div
                className={styles.promptPill}
                onClick={handlePromptClick}
                style={{
                  backgroundColor: currentPrompt.bgColor,
                  color: currentPrompt.textColor,
                  border: `1px solid ${currentPrompt.bgColor}`,
                }}
              >
                <span
                  key={currentPromptIndex}
                  className={styles.promptTextAnim}
                >
                  {currentPrompt.text}
                </span>
              </div>

              <div className={styles.inputActions}>
                <Mic className={styles.micBtn} size={20} />
                <button className={styles.sendBtn}>
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
