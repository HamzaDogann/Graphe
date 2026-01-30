"use client";

import { motion } from "framer-motion";
import styles from "./UserMessage.module.scss";

interface UserMessageProps {
  content: string;
}

export const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <motion.div
      className={styles.userMessage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className={styles.messageContent}>{content}</div>
    </motion.div>
  );
};
