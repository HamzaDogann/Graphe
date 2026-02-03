"use client";

import { SidebarLogo } from "../SidebarLogo";
import { SidebarToggle } from "../SidebarToggle";
import { NewChartButton } from "../NewChartButton";
import { SidebarSearch } from "../SidebarSearch";
import { SidebarSection } from "../SidebarSection";
import { SidebarNavItem } from "../SidebarNavItem";
import { SidebarChatList } from "../SidebarChatList";
import { SidebarUser } from "../SidebarUser";
import {
  BarChart3,
  FileChartPie,
  Inbox,
  MessageCircleMore,
} from "lucide-react";
import styles from "./Sidebar.module.scss";

const mockChats = [
  { id: "1", title: "Dashboard Design Ideas for Analytics" },
  { id: "2", title: "Exploring Business Plans and Strategies" },
  { id: "3", title: "Daily Motivation Chat Session" },
  { id: "4", title: "Brainstorming with AI" },
  { id: "5", title: "Learning SQL Queries Basics" },
];

const mockUser = {
  name: "Hamza Doğan",
  email: "hamzadogn011@gmail.com",
  avatar:
    "https://media.licdn.com/dms/image/v2/D4D03AQHkSqlixwSRag/profile-displayphoto-scale_400_400/B4DZljBdjJHsAg-/0/1758302952317?e=1766620800&v=beta&t=kGzKSQ_E1WY9AN_W6zBonPn8F4Rh5DQw1LhqWfErBDY",
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
            <SidebarChatList chats={mockChats} collapsed={false} />
          </SidebarSection>
        </div>
      </div>

      {/* User Profile */}
      <SidebarUser collapsed={collapsed} />
    </aside>
  );
}
