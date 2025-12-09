import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={styles.chatContainer}>
      <div className={styles.welcomeSection}>
        <div className={styles.logoIcon}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path
              d="M10 22V10h4.5c1.5 0 2.8.4 3.7 1.2.9.8 1.3 1.8 1.3 3.1 0 1-.3 1.9-.9 2.7-.6.7-1.5 1.2-2.6 1.4l4 3.6h-3.2l-3.6-3.4H13v3.4h-3zm3-6h1.3c.8 0 1.4-.2 1.8-.5.4-.4.6-.9.6-1.5s-.2-1.1-.6-1.4c-.4-.4-1-.5-1.8-.5H13v3.9z"
              fill="white"
            />
            <defs>
              <linearGradient
                id="gradient"
                x1="0"
                y1="0"
                x2="32"
                y2="32"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#667eea" />
                <stop offset="1" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className={styles.welcomeTitle}>How can I help you today?</h1>
        <p className={styles.welcomeSubtitle}>
          Start a conversation or choose from suggestions below
        </p>
      </div>

      <div className={styles.suggestionsGrid}>
        <SuggestionCard
          icon="📊"
          title="Create a chart"
          description="Generate beautiful charts from your data"
        />
        <SuggestionCard
          icon="🎨"
          title="Design a canvas"
          description="Create visual compositions and diagrams"
        />
        <SuggestionCard
          icon="📝"
          title="Analyze data"
          description="Get insights from your datasets"
        />
        <SuggestionCard
          icon="💡"
          title="Brainstorm ideas"
          description="Explore creative concepts together"
        />
      </div>

      {/* Chat Input */}
      <div className={styles.chatInputWrapper}>
        <div className={styles.chatInputContainer}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Message Graphe..."
          />
          <button className={styles.sendButton} aria-label="Send message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>
          Graphe can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  icon: string;
  title: string;
  description: string;
}

function SuggestionCard({ icon, title, description }: SuggestionCardProps) {
  return (
    <button className={styles.suggestionCard}>
      <span className={styles.suggestionIcon}>{icon}</span>
      <div className={styles.suggestionContent}>
        <span className={styles.suggestionTitle}>{title}</span>
        <span className={styles.suggestionDescription}>{description}</span>
      </div>
    </button>
  );
}
