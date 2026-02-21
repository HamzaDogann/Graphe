import { Variants } from "framer-motion";

/**
 * 🎨 Graphe Animation Library
 * Tüm animasyonlar burada merkezi olarak tanımlanır.
 * Kullanım: import { dropdownAnimation } from "@/lib/animations";
 */

// ============================================
// 📦 DROPDOWN / TOOLTIP ANIMATIONS
// ============================================

/** Dropdown - Sol alttan açılır (User menu gibi) */
export const dropdownFromBottomLeft: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

/** Dropdown - Sağ üstten açılır (Header menu gibi) */
export const dropdownFromTopRight: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

/** Dropdown - Yukarıdan aşağı açılır */
export const dropdownFromTop: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// ============================================
// 🪟 MODAL ANIMATIONS
// ============================================

/** Modal backdrop */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/** Modal content - Ortadan scale */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1], // Custom easing
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

// ============================================
// 📝 LIST / ITEM ANIMATIONS
// ============================================

/** Liste container - Stagger children */
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** Liste item - Aşağıdan yukarı fade */
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// ============================================
// 💬 MESSAGE / CHAT ANIMATIONS
// ============================================

/** Mesaj balonu - Aşağıdan yukarı */
export const messageAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// ============================================
// 🔄 FADE ANIMATIONS
// ============================================

/** Basit fade in/out */
export const fadeInOut: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/** Fade + Scale */
export const fadeScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
    },
  },
};

/** Tooltip / Popover - Aşağıdan scale + fade (ColorPicker, ChartInfo, PaletteMenu gibi) */
export const tooltipPopover: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 4,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// ============================================
// 🎯 TRANSFORM ORIGINS (CSS değerleri)
// ============================================

export const transformOrigins = {
  topLeft: "top left",
  topRight: "top right",
  topCenter: "top center",
  bottomLeft: "bottom left",
  bottomRight: "bottom right",
  bottomCenter: "bottom center",
  center: "center",
} as const;

// ============================================
// ⚡ TRANSITION PRESETS
// ============================================

export const transitions = {
  fast: { duration: 0.1, ease: "easeOut" },
  normal: { duration: 0.2, ease: "easeOut" },
  slow: { duration: 0.3, ease: "easeOut" },
  spring: { type: "spring", stiffness: 300, damping: 25 },
  bounce: { type: "spring", stiffness: 400, damping: 10 },
} as const;
