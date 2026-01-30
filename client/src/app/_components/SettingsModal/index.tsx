"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Globe,
  Bell,
  Palette,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Modal } from "@/app/_components";
import styles from "./SettingsModal.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab =
  | "profile"
  | "language"
  | "notifications"
  | "appearance"
  | "privacy"
  | "help";

interface MenuItem {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <User size={20} />,
    description: "Manage your account details",
  },
  {
    id: "language",
    label: "Voice & Language",
    icon: <Globe size={20} />,
    description: "Speech and language preferences",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={20} />,
    description: "Configure alert settings",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette size={20} />,
    description: "Customize the look and feel",
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: <Shield size={20} />,
    description: "Manage your data and security",
  },
  {
    id: "help",
    label: "Help & Support",
    icon: <HelpCircle size={20} />,
    description: "Get help and contact us",
  },
];

export const SettingsModal = ({ isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className={styles.contentSection}>
            <h3>Profile Settings</h3>
            <p className={styles.placeholder}>
              Manage your profile information, avatar, and account details here.
            </p>
          </div>
        );
      case "language":
        return (
          <div className={styles.contentSection}>
            <h3>Voice & Language</h3>
            <p className={styles.placeholder}>
              Configure voice recognition language and text-to-speech
              preferences.
            </p>
          </div>
        );
      case "notifications":
        return (
          <div className={styles.contentSection}>
            <h3>Notifications</h3>
            <p className={styles.placeholder}>
              Manage email notifications, push alerts, and in-app messages.
            </p>
          </div>
        );
      case "appearance":
        return (
          <div className={styles.contentSection}>
            <h3>Appearance</h3>
            <p className={styles.placeholder}>
              Customize themes, colors, and display settings.
            </p>
          </div>
        );
      case "privacy":
        return (
          <div className={styles.contentSection}>
            <h3>Privacy & Security</h3>
            <p className={styles.placeholder}>
              Manage data privacy, security settings, and account protection.
            </p>
          </div>
        );
      case "help":
        return (
          <div className={styles.contentSection}>
            <h3>Help & Support</h3>
            <p className={styles.placeholder}>
              Access documentation, tutorials, and contact support.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      icon={<Settings size={22} />}
      width="medium"
    >
      <div className={styles.settingsLayout}>
        {/* Sidebar Navigation */}
        <nav className={styles.sidebar}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.menuItem} ${
                activeTab === item.id ? styles.active : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <div className={styles.menuText}>
                <span className={styles.menuLabel}>{item.label}</span>
                <span className={styles.menuDescription}>
                  {item.description}
                </span>
              </div>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className={styles.content}>{renderContent()}</div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
