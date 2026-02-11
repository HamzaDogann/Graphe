"use client";

import { useEffect } from "react";
import { SidebarLogo } from "../SidebarLogo";
import { SidebarToggle } from "../SidebarToggle";
import { NewChartButton } from "../NewChartButton";
import { SidebarSearch } from "../SidebarSearch";
import { SidebarSection } from "../SidebarSection";
import { SidebarNavItem } from "../SidebarNavItem";
import { SidebarChatList } from "../SidebarChatList";
import { SidebarUser } from "../SidebarUser";
import { useChatStore } from "@/store/useChatStore";
import {
  BarChart3,
  FileChartPie,
  Inbox,
  MessageCircleMore,
} from "lucide-react";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  // Get chats from store
  const { chats, fetchChats, isLoadingChats } = useChatStore();

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Transform chats for SidebarChatList format
  const chatListItems = chats.map((chat) => ({
    id: chat.id,
    title: chat.title || "New Chat",
  }));
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarContent}>
        {/* Collapsed Content */}
        <div
          className={`${styles.collapsedContent} ${
            collapsed ? styles.visible : ""
          }`}
        >
          <SidebarToggle onToggle={onToggle} />
          <NewChartButton collapsed={true} />
          <SidebarSearch collapsed={true} />
          <div className={styles.collapsedNav}>
            <SidebarNavItem
              icon={<BarChart3 size={20} />}
              label="Charts"
              href="/charts"
              collapsed={true}
            />
            <SidebarNavItem
              icon={<FileChartPie size={20} />}
              label="Canvases"
              href="/dashboard/canvases"
              collapsed={true}
              variant="canvases"
            />
          </div>
        </div>

        {/* Expanded Content */}
        <div
          className={`${styles.expandedContent} ${
            !collapsed ? styles.visible : ""
          }`}
        >
          {/* Logo & Toggle */}
          <SidebarLogo collapsed={false} onToggle={onToggle} />

          {/* New Chart Button */}
          <NewChartButton collapsed={false} />

          <SidebarSearch collapsed={false} />

          {/* Saved Section */}
          <SidebarSection
            title="Saved"
            icon={<Inbox size={20} />}
            collapsed={false}
          >
            <SidebarNavItem
              icon={<BarChart3 size={20} />}
              label="Charts"
              href="/charts"
              collapsed={false}
            />
            <SidebarNavItem
              icon={<FileChartPie size={20} />}
              label="Canvases"
              href="/dashboard/canvases"
              collapsed={false}
              variant="canvases"
            />
          </SidebarSection>

          {/* Recent Chats Section */}
          <SidebarSection
            title="Recent Chats"
            icon={<MessageCircleMore size={20} />}
            collapsed={false}
          >
            {isLoadingChats ? (
              <div className={styles.skeletonContainer}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.skeletonItem} />
                ))}
              </div>
            ) : chatListItems.length > 0 ? (
              <SidebarChatList chats={chatListItems} collapsed={false} />
            ) : (
              <div className={styles.noChats}>No chats yet</div>
            )}
          </SidebarSection>
        </div>
      </div>

      {/* User Profile */}
      <SidebarUser collapsed={collapsed} />
    </aside>
  );
}
