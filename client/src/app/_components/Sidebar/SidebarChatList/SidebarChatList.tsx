"use client";

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
  if (collapsed) {
    return (
      <div className={styles.collapsedList}>
        {chats.slice(0, 5).map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={styles.collapsedItem}
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
          href={`/chat/${chat.id}`}
          className={styles.chatItem}
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
