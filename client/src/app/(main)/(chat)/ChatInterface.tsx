"use client";

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

export default function ChatInterface({ uploadedFile }: ChatInterfaceProps) {
  return (
    <div className={styles.chatContainer}>
      <div className={styles.datasetBanner}>
        <div className={styles.fileInfo}>
          <div className={styles.dbIconWrapper}>
            <Database size={22} />
          </div>
          <div className={styles.fileText}>
            <span className={styles.fileLabel}>Dataset</span>
            <span className={styles.fileName}>
              {uploadedFile ? uploadedFile.name : "customer_informations.csv"}
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

      <div className={styles.contentWrapper}>
        {/* Hero Text */}
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Generate Chart with Graphe</h1>
          <p className={styles.heroSubtitle}>
            Just type one prompt to instantly create charts from your data.
          </p>
        </div>

        {/* Icons Grid */}
        <div className={styles.suggestionsGrid}>
          <div className={`${styles.suggestionCard} ${styles.bgBlue}`}>
            <LineChart size={28} />
          </div>
          <div className={`${styles.suggestionCard} ${styles.bgOrange}`}>
            <Table2 size={28} />
          </div>
          <div className={`${styles.suggestionCard} ${styles.bgGreen}`}>
            <PieChart size={28} />
          </div>
          <div className={`${styles.suggestionCard} ${styles.bgLime}`}>
            <Gauge size={28} />
          </div>
          <div className={`${styles.suggestionCard} ${styles.bgPurple}`}>
            <BarChart3 size={28} />
          </div>
          <div className={`${styles.suggestionCard} ${styles.bgRed}`}>
            <Network size={28} />
          </div>
        </div>

        {/* Input Area */}
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Ask anything..."
            className={styles.inputField}
            autoFocus
          />
          <div className={styles.inputFooter}>
            <span className={styles.promptPill}>
              Generate a pie chart based on the distribution of
              "column-name-here"
            </span>
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
  );
}
