"use client";

import { useState } from "react";
import { Sidebar } from "../_components/Sidebar";
import { Topbar } from "../_components/Topbar";
import styles from "../dashboard.module.scss";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
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
