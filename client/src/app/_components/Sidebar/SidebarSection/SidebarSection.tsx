"use client";

import { ReactNode } from "react";
import styles from "./SidebarSection.module.scss";

interface SidebarSectionProps {
  title: string;
  icon?: ReactNode;
  collapsed: boolean;
  children: ReactNode;
}

export function SidebarSection({
  title,
  icon,
  collapsed,
  children,
}: SidebarSectionProps) {
  return (
    <div className={styles.section}>
      {!collapsed && (
        <div className={styles.sectionHeader}>
          {icon && <span className={styles.sectionIcon}>{icon}</span>}
          <h3 className={styles.sectionTitle}>{title}</h3>
        </div>
      )}
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
}
