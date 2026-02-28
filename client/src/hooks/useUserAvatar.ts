"use client";

import { useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";

// Tutarlı renk paleti - aynı harf her zaman aynı renk
const AVATAR_COLORS = [
  { from: "#667eea", to: "#764ba2" }, // Purple
  { from: "#f093fb", to: "#f5576c" }, // Pink
  { from: "#4facfe", to: "#00f2fe" }, // Blue
  { from: "#43e97b", to: "#38f9d7" }, // Green
  { from: "#fa709a", to: "#fee140" }, // Orange-Pink
  { from: "#a8edea", to: "#fed6e3" }, // Soft Teal
  { from: "#ff9a9e", to: "#fecfef" }, // Soft Pink
  { from: "#ffecd2", to: "#fcb69f" }, // Peach
  { from: "#a18cd1", to: "#fbc2eb" }, // Lavender
  { from: "#ff6b6b", to: "#feca57" }, // Red-Yellow
  { from: "#48dbfb", to: "#0abde3" }, // Cyan
  { from: "#1dd1a1", to: "#10ac84" }, // Mint
];

/**
 * İsme göre tutarlı bir renk index'i döndürür
 * Aynı isim her zaman aynı rengi alır
 */
function getColorIndexFromName(name: string): number {
  if (!name) return 0;
  
  // İsmin tüm karakterlerinin ASCII değerlerini topla
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Pozitif değere çevir ve renk sayısına göre mod al
  return Math.abs(hash) % AVATAR_COLORS.length;
}

/**
 * İsimden baş harfleri çıkarır
 */
function getInitialsFromName(name: string | null | undefined): string {
  if (!name) return "U";
  
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface UserAvatarData {
  hasImage: boolean;
  imageUrl: string | null;
  initials: string;
  gradient: string;
  backgroundColor: string;
}

/**
 * Kullanıcı avatarı için gerekli tüm bilgileri sağlayan hook
 * - Resim varsa resmi kullanır
 * - Resim yoksa ismin baş harflerini ve tutarlı bir renk döndürür
 */
export function useUserAvatar(): UserAvatarData {
  const { user } = useUserStore();
  
  return useMemo(() => {
    const name = user?.name || user?.email || "";
    const initials = getInitialsFromName(name);
    const colorIndex = getColorIndexFromName(name);
    const color = AVATAR_COLORS[colorIndex];
    
    return {
      hasImage: Boolean(user?.image),
      imageUrl: user?.image || null,
      initials,
      gradient: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
      backgroundColor: color.from,
    };
  }, [user?.name, user?.email, user?.image]);
}

/**
 * Herhangi bir isim için avatar bilgisi döndürür
 * (useUserStore kullanmadan, raw datadan)
 */
export function getAvatarData(name: string | null | undefined, image?: string | null): UserAvatarData {
  const displayName = name || "";
  const initials = getInitialsFromName(displayName);
  const colorIndex = getColorIndexFromName(displayName);
  const color = AVATAR_COLORS[colorIndex];
  
  return {
    hasImage: Boolean(image),
    imageUrl: image || null,
    initials,
    gradient: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
    backgroundColor: color.from,
  };
}
