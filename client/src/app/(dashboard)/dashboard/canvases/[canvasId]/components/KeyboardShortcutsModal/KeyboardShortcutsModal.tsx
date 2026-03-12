"use client";

import { Modal } from "@/app/_components/Modal";
import { Keyboard } from "lucide-react";
import {
  type KeyboardShortcut,
  formatShortcut,
  groupShortcutsByCategory,
  SHORTCUT_CATEGORIES,
} from "@/hooks/useKeyboardShortcuts";
import styles from "./KeyboardShortcutsModal.module.scss";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) => {
  const groupedShortcuts = groupShortcutsByCategory(shortcuts);

  // Filter out duplicate shortcuts (same description) for cleaner display
  const dedupeShortcuts = (shortcuts: KeyboardShortcut[]) => {
    const seen = new Set<string>();
    return shortcuts.filter((s) => {
      if (seen.has(s.description)) return false;
      seen.add(s.description);
      return true;
    });
  };

  // Order of categories to display
  const categoryOrder: (keyof typeof SHORTCUT_CATEGORIES)[] = [
    "general",
    "edit",
    "view",
    "element",
    "navigation",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      icon={<Keyboard size={20} />}
      width="medium"
    >
      <div className={styles.shortcutsContainer}>
        {categoryOrder.map((categoryKey) => {
          const categoryShortcuts = groupedShortcuts[categoryKey];
          if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

          return (
            <div key={categoryKey} className={styles.category}>
              <h3 className={styles.categoryTitle}>
                {SHORTCUT_CATEGORIES[categoryKey]}
              </h3>
              <div className={styles.shortcutsList}>
                {dedupeShortcuts(categoryShortcuts).map((shortcut, index) => (
                  <div key={index} className={styles.shortcutItem}>
                    <span className={styles.description}>
                      {shortcut.description}
                    </span>
                    <span className={styles.keys}>
                      {formatShortcut(shortcut)
                        .split(" + ")
                        .map((key, i) => (
                          <kbd key={i} className={styles.key}>
                            {key}
                          </kbd>
                        ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Additional mouse shortcuts */}
        <div className={styles.category}>
          <h3 className={styles.categoryTitle}>Mouse</h3>
          <div className={styles.shortcutsList}>
            <div className={styles.shortcutItem}>
              <span className={styles.description}>Zoom in/out</span>
              <span className={styles.keys}>
                <kbd className={styles.key}>Alt</kbd>
                <span className={styles.plus}>+</span>
                <kbd className={styles.key}>Scroll</kbd>
              </span>
            </div>
            <div className={styles.shortcutItem}>
              <span className={styles.description}>
                Zoom in/out (alternative)
              </span>
              <span className={styles.keys}>
                <kbd className={styles.key}>Ctrl</kbd>
                <span className={styles.plus}>+</span>
                <kbd className={styles.key}>Scroll</kbd>
              </span>
            </div>
            <div className={styles.shortcutItem}>
              <span className={styles.description}>Pan canvas</span>
              <span className={styles.keys}>
                <kbd className={styles.key}>Scroll</kbd>
              </span>
            </div>
            <div className={styles.shortcutItem}>
              <span className={styles.description}>Select element</span>
              <span className={styles.keys}>
                <kbd className={styles.key}>Click</kbd>
              </span>
            </div>
            <div className={styles.shortcutItem}>
              <span className={styles.description}>Move element</span>
              <span className={styles.keys}>
                <kbd className={styles.key}>Drag</kbd>
              </span>
            </div>
            <div className={styles.shortcutItem}>
              <span className={styles.description}>Resize element</span>
              <span className={styles.keys}>
                <kbd className={styles.key}>Drag Handle</kbd>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
