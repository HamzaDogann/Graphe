"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// TypeScript Window Tanımlamaları
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: any;
  }
}

export const useVoiceRecorder = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(40).fill(10));

  // Referanslar
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // YENİ: Mikrofon akışını tutmak için referans
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // --- DURDURMA FONKSİYONU ---
  const stopListening = useCallback(() => {
    // 1. Speech Recognition Durdur
    if (recognitionRef.current) {
        try {
            recognitionRef.current.stop();
        } catch (e) {
            // Zaten durmuşsa hata vermemesi için
        }
    }

    // 2. Animasyonu Durdur
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    
    // 3. MİKROFONU DONANIM OLARAK KAPAT (ÇÖZÜM BURADA)
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
            track.stop(); // Tarayıcıdaki kırmızı noktayı söndüren kod
        });
        mediaStreamRef.current = null;
    }

    // 4. Audio Context Temizliği
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  // --- BAŞLATMA FONKSİYONU ---
  const startListening = useCallback(async () => {
    // Tarayıcı Desteği Kontrolü
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Tarayıcınız sesli komutu desteklemiyor.");
      return;
    }

    setIsListening(true);
    setTranscript("");

    // A. Speech Recognition Başlat
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US"; // İstersen 'tr-TR' yapabilirsin

    recognitionRef.current.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interim += event.results[i][0].transcript;
      }
      setTranscript(interim);
    };

    recognitionRef.current.onerror = (event: any) => {
        // 'no-speech' veya 'aborted' hatalarını yoksayabilirsin
        if (event.error !== 'no-speech') {
            console.error("Speech recognition error", event.error);
            stopListening();
        }
    };

    try {
        recognitionRef.current.start();
    } catch (e) {
        console.error("Recognition start failed", e);
        stopListening();
        return;
    }

    // B. Audio Visualizer Başlat
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Akışı referansa kaydet (Durdururken kullanacağız)
      mediaStreamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const bars = [];
        // Frekans verisini 40 çubuğa indirge
        const step = Math.floor(bufferLength / 40);
        
        for (let i = 0; i < 40; i++) {
          const val = dataArray[i * step] || 0;
          const height = Math.max(4, (val / 255) * 35);
          bars.push(height);
        }
        
        setVisualizerData(bars);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      updateVisualizer();
      
    } catch (err) {
      console.error("Mikrofon erişim hatası:", err);
      stopListening();
    }
  }, [stopListening]);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  // Component Unmount Olduğunda Temizlik
  useEffect(() => {
    return () => {
        // useEffect cleanup fonksiyonunda stopListening'i çağırmak yerine
        // manuel temizlik yapmak daha güvenlidir (Dependency döngüsünü kırmak için)
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (recognitionRef.current) recognitionRef.current.stop();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    isListening,
    transcript,
    visualizerData,
    startListening,
    stopListening,
    resetTranscript
  };
};