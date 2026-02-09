"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, BarChart3, LayoutDashboard } from "lucide-react";
import { useDatasetStore } from "@/store/useDatasetStore";
import { useUserStore } from "@/store/useUserStore";
import { useChatStore } from "@/store/useChatStore";
import { ProcessingLoader } from "@/app/_components";

import styles from "./WelcomeScreen.module.scss";

export default function WelcomeScreen() {
  const parseFile = useDatasetStore((state) => state.parseFile);
  const { user } = useUserStore();
  const createChat = useChatStore((state) => state.createChat);
  const router = useRouter();

  const [showIntro, setShowIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [revealedStep, setRevealedStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kullanıcı adı yoksa varsayılan olarak "User" veya boş string
  const username = user?.name?.split(" ")[0] || "User";

  useEffect(() => {
    const mountId = window.setTimeout(() => setIntroVisible(true), 50);

    const leaveTimer = setTimeout(() => {
      setIntroLeaving(true);
      const removeTimer = setTimeout(() => {
        setShowIntro(false);
      }, 600);
      return () => clearTimeout(removeTimer);
    }, 1200);

    return () => {
      clearTimeout(mountId);
      clearTimeout(leaveTimer);
    };
  }, []);

  useEffect(() => {
    if (showIntro) return;

    const delays = [
      { step: 1, delay: 100 },
      { step: 2, delay: 300 },
      { step: 3, delay: 500 },
      { step: 4, delay: 750 },
      { step: 5, delay: 1000 },
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);

      // Parse the file and store data before navigation
      await parseFile(file);

      // Create a new chat via API
      const newChat = await createChat();

      if (newChat) {
        // Navigate to the new chat page
        router.push(`/dashboard/chats/${newChat.id}`);
      } else {
        // Handle error - still navigate but without a chat ID
        setIsUploading(false);
      }
    }
  };

  // Show loading overlay when uploading
  if (isUploading) {
    return (
      <div className={styles.welcomeRoot}>
        <ProcessingLoader text="Processing data..." size="medium" />
      </div>
    );
  }

  return (
    <div className={styles.welcomeRoot}>
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
              <span
                className={styles.coloredTextGlow}
              >{`Hello ${username}`}</span>
              <span className={styles.coloredText}>{`Hello ${username}`}</span>
            </span>
          </h1>
        </div>
      )}

      {!showIntro && (
        <div className={styles.welcomeMain}>
          <div
            className={`${styles.welcomeCircle} ${
              revealedStep >= 1 ? styles.revealVisible : styles.revealHidden
            }`}
          />

          <div className={styles.titleWrapper}>
            <h1
              className={`${styles.welcomeTitle} ${
                revealedStep >= 2 ? styles.revealVisible : styles.revealHidden
              }`}
            >
              Turn your data into insightful charts
            </h1>
          </div>

          <p
            className={`${styles.welcomeSubtitle} ${
              revealedStep >= 3 ? styles.revealVisible : styles.revealHidden
            }`}
          >
            Upload your data, let AI create charts, customize them, and organize
            everything on your Canvas.
          </p>

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
