"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useChatStore, selectActiveChat } from "@/store/useChatStore";
import { isValidChatId } from "@/lib/generateId";
import { ProcessingLoader } from "@/app/_components";
import { MessageSquare, Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "./chat.module.scss";

// Lazy load ChatInterface
const ChatInterface = dynamic(
  () => import("@/app/(main)/_features/chat/ChatInterface"),
  {
    loading: () => <ProcessingLoader text="Loading chat..." size="medium" />,
    ssr: false,
  },
);

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.chatId as string;

  // Chat store
  const { chats, isLoadingChats, setActiveChat, fetchChats } = useChatStore();
  const activeChat = useChatStore(selectActiveChat);

  // Fetch chats if not loaded yet
  useEffect(() => {
    if (chats.length === 0 && !isLoadingChats) {
      fetchChats();
    }
  }, [chats.length, isLoadingChats, fetchChats]);

  // Set active chat when chatId changes
  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
  }, [chatId, setActiveChat]);

  // Show loading while fetching chats
  if (isLoadingChats) {
    return <ProcessingLoader text="Loading chat..." size="medium" />;
  }

  // Validate chat ID format
  if (!isValidChatId(chatId)) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>
          <Hash size={48} />
        </div>
        <h2>Invalid Chat ID</h2>
        <p>The chat ID format is not valid</p>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Chat not found (after loading)
  if (!activeChat && chats.length > 0) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>
          <MessageSquare size={48} />
        </div>
        <h2>Chat Not Found</h2>
        <p>The chat you&apos;re looking for doesn&apos;t exist</p>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <ChatInterface />;
}
