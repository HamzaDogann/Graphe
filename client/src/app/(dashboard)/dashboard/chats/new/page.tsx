"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useChatStore } from "@/store/useChatStore";
import { ProcessingLoader } from "@/app/_components";

// Lazy load ChatInterface
const ChatInterface = dynamic(
  () => import("@/app/(main)/_features/chat/ChatInterface"),
  {
    loading: () => <ProcessingLoader text="Loading..." size="medium" />,
    ssr: false,
  },
);

/**
 * New Chat Page
 *
 * This page shows an empty chat with HeroSection and SuggestionGrid.
 * When user sends first message, a new chat is created via lazy creation.
 * No chat exists in DB until first message is sent.
 */
export default function NewChatPage() {
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  // Clear active chat on mount (ensure fresh state)
  useEffect(() => {
    setActiveChat(null);
  }, [setActiveChat]);

  return <ChatInterface />;
}
