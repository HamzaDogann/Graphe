"use client";

import { Settings, LogOut, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import styles from "./SidebarUser.module.scss";

interface User {
  name: string;
  email: string;
  avatar: string | null;
}

interface SidebarUserProps {
  user: User;
  collapsed: boolean;
}

export function SidebarUser({ user, collapsed }: SidebarUserProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={styles.userContainer} ref={menuRef}>
      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className={styles.dropdownMenu}>
          <button className={styles.menuItem}>
            <Sparkles size={18} />
            <span>Upgrade to Pro</span>
          </button>
          <button className={styles.menuItem}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className={styles.menuDivider} />
          <button className={`${styles.menuItem} ${styles.danger}`}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      )}

      {/* User Button */}
      <button
        className={`${styles.userButton} ${collapsed ? styles.collapsed : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className={styles.avatar}>
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
