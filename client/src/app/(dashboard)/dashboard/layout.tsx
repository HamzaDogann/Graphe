"use client";

import { Sidebar } from "@/app/_components/Sidebar";
import { Topbar } from "@/app/_components/Topbar";
import { useSidebarStore } from "@/store/useSidebarStore";
import styles from "@/app/dashboard.module.scss";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar collapsed={isCollapsed} onToggle={toggleCollapsed} />
      <div
        className={`${styles.mainArea} ${isCollapsed ? styles.expanded : ""}`}
      >
        <Topbar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
