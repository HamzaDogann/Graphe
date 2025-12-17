"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeScreen.module.scss";
import { Upload, BarChart3, LayoutDashboard } from "lucide-react";

// Prop tanımı ekliyoruz
interface WelcomeScreenProps {
  onFileUpload: (file: File) => void;
}

export default function WelcomeScreen({ onFileUpload }: WelcomeScreenProps) {
  // Intro (Hello Hamza) durumu
  const [showIntro, setShowIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [revealedStep, setRevealedStep] = useState(0);

  // Placeholder username
  const username = "Hamza";

  // 1. EFFEKT: Intro Animasyonu Yönetimi
  useEffect(() => {
    // 1. Mount sonrası çok kısa bekle ve yazıyı görünür yap (Fade-in)
    const mountId = window.setTimeout(() => setIntroVisible(true), 50);

    // 2. Yazı ekranda 1 saniye (1000ms) kalsın, sonra çıkış animasyonunu (leaving) başlat
    const leaveTimer = setTimeout(() => {
      setIntroLeaving(true);

      // 3. Çıkış animasyonu CSS tarafında 600ms sürüyor.
      // Bu süre bitince intro'yu DOM'dan kaldır ve ana içeriği başlat.
      const removeTimer = setTimeout(() => {
        setShowIntro(false);
      }, 600);

      return () => clearTimeout(removeTimer);
    }, 1200); // 1.2 saniye bekle (okuma süresi)

    return () => {
      clearTimeout(mountId);
      clearTimeout(leaveTimer);
    };
  }, []);

  // 2. EFFEKT: Ana İçerik Sıralı Gösterimi (Intro bittikten sonra çalışır)
  useEffect(() => {
    if (showIntro) return;

    // Sıralama: Logo -> Title -> Subtitle -> Cards -> Upload
    const delays = [
      { step: 1, delay: 100 }, // Logo
      { step: 2, delay: 300 }, // Title
      { step: 3, delay: 500 }, // Subtitle
      { step: 4, delay: 750 }, // Cards
      { step: 5, delay: 1000 }, // Upload & Disclaimer
    ];

    const timers: number[] = [];

    delays.forEach(({ step, delay }) => {
      const t = window.setTimeout(() => {
        setRevealedStep(step);
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach((id) => clearTimeout(id));
  }, [showIntro]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className={styles.welcomeRoot}>
      {/* Gizli Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".csv, .xlsx, .xls, .json"
        onChange={handleFileChange}
      />

      {showIntro && (
        <div className={styles.introOverlay}>
          <h1
            className={`${styles.greeting} ${
              introVisible ? styles.greetingVisible : styles.greetingHidden
            } ${introLeaving ? styles.greetingLeave : ""}`}
          >
            <span className={styles.coloredTextWrapper}>
              <span className={styles.coloredTextGlow}>
                {`Hello ${username}`}
              </span>
              <span className={styles.coloredText}>{`Hello ${username}`}</span>
            </span>
          </h1>
        </div>
      )}

      {/* --- ANA İÇERİK (Intro gidince görünür, ama elemanlar opacity 0 başlar) --- */}
      {!showIntro && (
        <div className={styles.welcomeMain}>
          {/* Adım 1: Logo */}
          <div
            className={`${styles.welcomeCircle} ${
              revealedStep >= 1 ? styles.revealVisible : styles.revealHidden
            }`}
          />

          <div className={styles.titleWrapper}>
            {/* Adım 2: Title */}
            <h1
              className={`${styles.welcomeTitle} ${
                revealedStep >= 2 ? styles.revealVisible : styles.revealHidden
              }`}
            >
              Turn your data into insightful charts
            </h1>
          </div>

          {/* Adım 3: Subtitle */}
          <p
            className={`${styles.welcomeSubtitle} ${
              revealedStep >= 3 ? styles.revealVisible : styles.revealHidden
            }`}
          >
            Upload your data, let AI create charts, customize them, and organize
            everything on your Canvas.
          </p>

          {/* Adım 4: Cards */}
          <div
            className={`${styles.cardGrid} ${
              revealedStep >= 4 ? styles.revealVisible : styles.revealHidden
            }`}
          >
            <div className={styles.card}>
              <div className={`${styles.cardIcon} ${styles.cardIconGreen}`}>
                <Upload size={28} />
              </div>
              <div className={styles.cardTitle}>Upload your data</div>
              <div className={styles.cardDesc}>
                Import CSV, XLSX, or JSON files directly into the app.
              </div>
            </div>
            <div className={styles.card}>
              <div className={`${styles.cardIcon} ${styles.cardIconBlue}`}>
                <BarChart3 size={28} />
              </div>
              <div className={styles.cardTitle}>Generate charts</div>
              <div className={styles.cardDesc}>
                AI creates charts automatically. Customize themes, colors, and
                styles.
              </div>
            </div>
            <div className={styles.card}>
              <div className={`${styles.cardIcon} ${styles.cardIconRed}`}>
                <LayoutDashboard size={28} />
              </div>
              <div className={styles.cardTitle}>Organize on Canvas</div>
              <div className={styles.cardDesc}>
                Arrange charts on the Canvas, edit layouts, and print or export
                when ready.
              </div>
            </div>
          </div>

          <div
            className={`${styles.uploadSection} ${
              revealedStep >= 5 ? styles.revealVisible : styles.revealHidden
            }`}
          >
            <div className={styles.uploadWrap}>
              <img
                src="/welcomescreen/csv.svg"
                alt="csv"
                className={`${styles.sideIcon} ${styles.leftIcon}`}
                loading="lazy"
              />

              <button onClick={handleUploadClick} className={styles.uploadBtn}>
                <span className={styles.uploadBtnIcon}>
                  <Upload size={22} />
                </span>
                Upload Data
              </button>

              <img
                src="/welcomescreen/json.svg"
                alt="json"
                className={`${styles.sideIcon} ${styles.rightIcon}`}
                loading="lazy"
              />
            </div>
            <div className={styles.uploadDisclaimer}>
              Your data remains secure and private.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
