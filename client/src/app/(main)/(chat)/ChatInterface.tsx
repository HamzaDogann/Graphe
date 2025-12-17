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
  X,
  Check,
} from "lucide-react";
import styles from "./ChatInterface.module.scss";

interface ChatInterfaceProps {
  uploadedFile: File | null;
}

// TypeScript için SpeechRecognition tanımlaması
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");

  // --- VOICE MODE STATES ---
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState(""); // Sesle gelen geçici metin
  const [visualizerData, setVisualizerData] = useState<number[]>(
    new Array(40).fill(10)
  ); // Dalga verisi

  // Referanslar
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Animasyon Zamanlayıcısı
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  // Prompt Döngüsü
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Textarea Auto-Resize
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  const currentPrompt = PROMPTS[currentPromptIndex];

  const handlePromptClick = () => {
    setInputValue(currentPrompt.text);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Gönder:", inputValue);
    }
  };

  // --- VOICE LOGIC ---

  const startListening = async () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Tarayıcınız sesli komutu desteklemiyor.");
      return;
    }

    setIsListening(true);
    setVoiceText("");

    // 1. Speech Recognition Başlat
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US"; // veya 'tr-TR'

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }
      setVoiceText(interimTranscript);
    };

    recognitionRef.current.start();

    // 2. Audio Visualizer Başlat
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Veriyi işle: 40 çubukluk bir dizi oluştur
        const bars = [];
        const step = Math.floor(bufferLength / 40);
        for (let i = 0; i < 40; i++) {
          const val = dataArray[i * step];
          // Değeri 5px ile 30px arasına normalize et
          const height = Math.max(4, (val / 255) * 35);
          bars.push(height);
        }
        setVisualizerData(bars);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (err) {
      console.error("Mikrofon erişim hatası:", err);
      stopAudioContext();
      setIsListening(false);
    }
  };

  const stopAudioContext = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
  };

  const confirmListening = () => {
    // Sesi durdur
    if (recognitionRef.current) recognitionRef.current.stop();
    stopAudioContext();

    // Metni inputa ekle
    if (voiceText) {
      setInputValue((prev) => (prev ? `${prev} ${voiceText}` : voiceText));
    }

    setIsListening(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const cancelListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    stopAudioContext();
    setIsListening(false);
    setVoiceText("");
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
        <div className={styles.upperContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Generate Chart with Graphe</h1>
            <p className={styles.heroSubtitle}>
              Just type one prompt to instantly create charts from your data.
            </p>
          </div>
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
        </div>

        {/* PARENT: Border Wrapper */}
        <div
          className={`${styles.inputBorderWrapper} ${
            isAnimating ? styles.animating : styles.static
          }`}
        >
          {/* CHILD: Input İçeriği */}
          <div className={styles.inputWrapper}>
            {/* 
               NORMAL MODE: Textarea Göster 
               VOICE MODE: Textarea Gizle (Görsel bütünlük için)
            */}
            {!isListening && (
              <textarea
                ref={textareaRef}
                placeholder="Ask anything..."
                className={styles.inputField}
                autoFocus
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}

            {/* LISTENING MODE: Ses dalgaları alanı (Textarea yerine geçer) */}
            {isListening && (
              <div className={styles.voiceContainer}>
                <div className={styles.waveWrapper}>
                  {visualizerData.map((height, i) => (
                    <div
                      key={i}
                      className={styles.waveBar}
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>
                {/* Konuşulan metni canlı göstermek istersen burayı açabilirsin */}
                {/* <p className={styles.liveText}>{voiceText || "Listening..."}</p> */}
              </div>
            )}

            <div className={styles.inputFooter}>
              {/* NORMAL FOOTER */}
              {!isListening && (
                <>
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
                    <button className={styles.micBtn} onClick={startListening}>
                      <Mic size={20} />
                    </button>
                    <button className={styles.sendBtn}>
                      <ArrowUp size={18} />
                    </button>
                  </div>
                </>
              )}

              {/* VOICE FOOTER CONTROLS */}
              {isListening && (
                <div className={styles.voiceControls}>
                  <div className={styles.voiceStatus}>
                    {voiceText ? "Hearing..." : "Listening..."}
                  </div>
                  <div className={styles.voiceActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={cancelListening}
                    >
                      <X size={22} />
                    </button>
                    <button
                      className={styles.confirmBtn}
                      onClick={confirmListening}
                    >
                      <Check size={22} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
