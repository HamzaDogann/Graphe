"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useChatStore } from "@/store/useChatStore";
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
  const router = useRouter();
  const chatId = params.chatId as string;

  const { chats, activeChat, setActiveChat } = useChatStore();

  useEffect(() => {
    // Find and set the active chat
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
    }
  }, [chatId, chats, setActiveChat]);

  // Find the chat from store
  const chat = chats.find((c) => c.id === chatId);

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

  // Chat not found
  if (!chat) {
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
