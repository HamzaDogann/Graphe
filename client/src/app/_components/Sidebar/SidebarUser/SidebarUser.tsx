"use client";

import { Settings, LogOut, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SidebarUser.module.scss";
import { useUserStore } from "@/store/useUserStore";
import { SettingsModal } from "@/app/_components";
import { dropdownFromBottomLeft, transformOrigins } from "@/lib/animations";

interface SidebarUserProps {
  collapsed: boolean;
}

export function SidebarUser({ collapsed }: SidebarUserProps) {
  const { user, isLoadingUser, logout } = useUserStore();

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

  // Show skeleton while loading
  if (isLoadingUser) {
    return (
      <div className={styles.userContainer}>
        {collapsed ? (
          <div className={styles.skeletonAvatarCollapsed} />
        ) : (
          <div className={styles.skeletonUser}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonName} />
              <div className={styles.skeletonEmail} />
            </div>
          </div>
        )}
      </div>
    );
  }

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
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={styles.dropdownMenu}
            variants={dropdownFromBottomLeft}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: transformOrigins.bottomLeft }}
          >
            <button className={styles.menuItem}>
              <Zap size={18} />
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
          </motion.div>
        )}
      </AnimatePresence>

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
