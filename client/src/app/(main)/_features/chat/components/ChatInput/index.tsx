"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, ArrowUp, X, Check } from "lucide-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { PromptCarousel } from "./PromptCarousel";
import styles from "./ChatInput.module.scss";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(true); // Border animasyonu için
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Custom Hook
  const {
    isListening,
    transcript,
    visualizerData,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecorder();

  // Initial Animation Timer
  useEffect(() => {
    const t = setTimeout(() => setIsAnimating(false), 1300);
    return () => clearTimeout(t);
  }, []);

  // Auto Resize Logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputValue]);

  // Voice Confirmation
  const handleConfirmVoice = () => {
    stopListening();
    if (transcript) {
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
    resetTranscript();
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleCancelVoice = () => {
    stopListening();
    resetTranscript();
  };

  const handlePromptClick = (text: string) => {
    setInputValue(text);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // Handle send message
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (trimmed && onSendMessage) {
      onSendMessage(trimmed);
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`${styles.inputBorderWrapper} ${
        isAnimating ? styles.animating : styles.static
      }`}
    >
      <div className={styles.inputWrapper}>
        {/* TEXT AREA MODE */}
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

        {/* VOICE MODE */}
        {isListening && <VoiceVisualizer data={visualizerData} />}

        <div className={styles.inputFooter}>
          {/* FOOTER ACTIONS - NORMAL MODE */}
          {!isListening && (
            <>
              <PromptCarousel onPromptClick={handlePromptClick} />
              <div className={styles.inputActions}>
                <button className={styles.micBtn} onClick={startListening}>
                  <Mic size={20} />
                </button>
                <button className={styles.sendBtn} onClick={handleSend}>
                  <ArrowUp size={18} />
                </button>
              </div>
            </>
          )}

          {/* FOOTER ACTIONS - VOICE MODE */}
          {isListening && (
            <div className={styles.voiceControls}>
              <div className={styles.voiceStatus}>
                {transcript ? "Hearing..." : "Listening..."}
              </div>
              <div className={styles.voiceActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancelVoice}
                >
                  <X size={22} />
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleConfirmVoice}
                >
                  <Check size={22} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
