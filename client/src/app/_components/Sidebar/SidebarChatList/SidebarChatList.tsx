"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./SidebarChatList.module.scss";

interface Chat {
  id: string;
  title: string;
}

interface SidebarChatListProps {
  chats: Chat[];
  collapsed: boolean;
}

export function SidebarChatList({ chats, collapsed }: SidebarChatListProps) {
  const params = useParams();
  const activeChatId = params?.chatId as string | undefined;

  if (collapsed) {
    return (
      <div className={styles.collapsedList}>
        {chats.slice(0, 5).map((chat) => (
          <Link
            key={chat.id}
            href={`/dashboard/chats/${chat.id}`}
            className={`${styles.collapsedItem} ${chat.id === activeChatId ? styles.active : ""}`}
            title={chat.title}
          >
            <span className={styles.chatArrow}>
              <ChevronRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.chatList}>
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/dashboard/chats/${chat.id}`}
          className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ""}`}
        >
          <span className={styles.chatArrow}>
            <ChevronRight size={14} />
          </span>
          <span className={styles.chatTitle}>{chat.title}</span>
        </Link>
      ))}
    </div>
  );
}
