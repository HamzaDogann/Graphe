"use client";

import { Settings, LogOut, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import styles from "./SidebarUser.module.scss";
import { useUserStore } from "@/store/useUserStore";
import { SettingsModal } from "@/app/_components";

interface SidebarUserProps {
  collapsed: boolean;
}

export function SidebarUser({ collapsed }: SidebarUserProps) {
  const { user, logout } = useUserStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    logout();
  };

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    setIsSettingsOpen(true);
  };

  if (!user) return null;

  // İsimden baş harfleri alma (Güvenli erişim)
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className={styles.userContainer} ref={menuRef}>
      {isMenuOpen && (
        <div className={styles.dropdownMenu}>
          <button className={styles.menuItem}>
            <Sparkles size={18} />
            <span>Upgrade to Pro</span>
          </button>
          <button className={styles.menuItem} onClick={handleSettingsClick}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className={styles.menuDivider} />
          <button
            className={`${styles.menuItem} ${styles.danger}`}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* User Button */}
      <button
        className={`${styles.userButton} ${collapsed ? styles.collapsed : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className={styles.avatar}>
          {user.image ? (
            <img src={user.image} alt={user.name || "User"} />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name || "User"}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
