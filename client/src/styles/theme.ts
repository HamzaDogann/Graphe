// Theme Colors - Uygulama genelinde kullanılacak renkler

export const colors = {
  // Primary
  primary: "#5C85FF", // Ana mavi renk (butonlar, linkler vb.)

  // Text Colors
  textDark: "#323039", // Ana metin rengi (başlıklar, önemli metinler)
  textSoft: "#797C84", // Soft metin rengi (label'lar, açıklamalar)

  // Border & Background
  borderLight: "#DDDEE3", // Input border, divider vb.

  // Base
  white: "#FFFFFF",
  black: "#000000",
} as const;

// CSS Variables olarak kullanmak için
export const cssVariables = `
  :root {
    --color-primary: ${colors.primary};
    --color-text-dark: ${colors.textDark};
    --color-text-soft: ${colors.textSoft};
    --color-border-light: ${colors.borderLight};
    --color-white: ${colors.white};
    --color-black: ${colors.black};
  }
`;
