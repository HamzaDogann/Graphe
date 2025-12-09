"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarNavItem.module.scss";

interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  collapsed: boolean;
  variant?: "default" | "canvases";
}

export function SidebarNavItem({
  icon,
  label,
  href,
  collapsed,
  variant = "default",
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const variantClass = variant === "canvases" ? styles.canvases : "";

  return (
    <Link
      href={href}
      className={`${styles.navItem} ${isActive ? styles.active : ""} ${
        collapsed ? styles.collapsed : ""
      } ${variantClass}`}
      title={collapsed ? label : undefined}
    >
      <span className={styles.icon}>{icon}</span>
      {!collapsed && <span className={styles.label}>{label}</span>}
    </Link>
  );
}
