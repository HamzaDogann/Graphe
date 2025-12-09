// Theme Colors - Uygulama genelinde kullanılacak renkler

export const colors = {
  // Primary
  primary: "#5C85FF", // Ana mavi renk (butonlar, linkler vb.)
  primaryLight: "#E8EEFF", // Primary light background
  primaryHover: "#4A73ED", // Primary hover state

  // Text Colors
  textDark: "#323039", // Ana metin rengi (başlıklar, önemli metinler)
  textSoft: "#797C84", // Soft metin rengi (label'lar, açıklamalar)
  textMuted: "#A0A3AB", // Muted text

  // Border & Background
  borderLight: "#DDDEE3", // Input border, divider vb.
  borderSoft: "#EEEEF0", // Softer border

  // Backgrounds
  bgLight: "#F8F9FB", // Light background (sidebar, panels)
  bgHover: "#F0F1F4", // Hover background
  bgActive: "#E8E9ED", // Active/Selected background

  // Status Colors
  success: "#22C55E", // Green
  successLight: "#DCFCE7",
  warning: "#F59E0B", // Orange
  warningLight: "#FEF3C7",
  error: "#EF4444", // Red
  errorLight: "#FEE2E2",

  // Accent Colors
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  green: "#10B981",
  greenLight: "#D1FAE5",
  coral: "#F87171",
  coralLight: "#FEE2E2",
  softBlueWhite: "#E7F0FF", // Soft blue white background

  // Base
  white: "#FFFFFF",
  black: "#000000",
} as const;

// Sidebar specific
export const sidebar = {
  width: 260,
  collapsedWidth: 72,
  transition: "0.3s ease",
} as const;

// CSS Variables olarak kullanmak için
export const cssVariables = `
  :root {
    --color-primary: ${colors.primary};
    --color-primary-light: ${colors.primaryLight};
    --color-primary-hover: ${colors.primaryHover};
    --color-text-dark: ${colors.textDark};
    --color-text-soft: ${colors.textSoft};
    --color-text-muted: ${colors.textMuted};
    --color-border-light: ${colors.borderLight};
    --color-border-soft: ${colors.borderSoft};
    --color-bg-light: ${colors.bgLight};
    --color-bg-hover: ${colors.bgHover};
    --color-bg-active: ${colors.bgActive};
    --color-success: ${colors.success};
    --color-success-light: ${colors.successLight};
    --color-warning: ${colors.warning};
    --color-warning-light: ${colors.warningLight};
    --color-error: ${colors.error};
    --color-error-light: ${colors.errorLight};
    --color-purple: ${colors.purple};
    --color-purple-light: ${colors.purpleLight};
    --color-green: ${colors.green};
    --color-green-light: ${colors.greenLight};
    --color-coral: ${colors.coral};
    --color-coral-light: ${colors.coralLight};
    --color-soft-blue-white: ${colors.softBlueWhite};
    --color-white: ${colors.white};
    --color-black: ${colors.black};
    --sidebar-width: ${sidebar.width}px;
    --sidebar-collapsed-width: ${sidebar.collapsedWidth}px;
    --sidebar-transition: ${sidebar.transition};
  }
`;
