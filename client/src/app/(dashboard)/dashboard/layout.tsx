"use client";

import { useState } from "react";
import { Sidebar } from "@/app/_components/Sidebar";
import { Topbar } from "@/app/_components/Topbar";
import styles from "@/app/dashboard.module.scss";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className={`${styles.mainArea} ${
          sidebarCollapsed ? styles.expanded : ""
        }`}
      >
        <Topbar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
