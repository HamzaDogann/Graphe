"use client";
import { useEffect, useState } from "react";
import styles from "./ChatInput.module.scss";

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

interface Props {
  onPromptClick: (text: string) => void;
}

export const PromptCarousel = ({ onPromptClick }: Props) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PROMPTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const current = PROMPTS[index];

  return (
    <div
      className={styles.promptPill}
      onClick={() => onPromptClick(current.text)}
      style={{
        backgroundColor: current.bgColor,
        color: current.textColor,
        border: `1px solid ${current.bgColor}`,
      }}
    >
      <span key={index} className={styles.promptTextAnim}>
        {current.text}
      </span>
    </div>
  );
};
