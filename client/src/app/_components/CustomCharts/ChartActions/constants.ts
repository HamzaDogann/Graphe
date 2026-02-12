import { TypographySettings } from "./types";

export const EXTENSION_LOGOS: Record<string, string> = {
  csv: "/extensionsLogo/CsvLogo.png",
  xlsx: "/extensionsLogo/ExcelLogo.webp",
  xls: "/extensionsLogo/ExcelLogo.webp",
  json: "/extensionsLogo/JsonLogo.png",
};

export const COLOR_PALETTES = {
  default: ["#5c85ff", "#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1", "#a55eea", "#fd9644", "#26de81"],
  pastel: ["#a8d8ea", "#aa96da", "#fcbad3", "#ffffd2", "#b5e7a0", "#f6d186", "#ffc8a2", "#d5aaff"],
  vibrant: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43"],
  ocean: ["#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#023e8a", "#03045e", "#48cae4", "#ade8f4"],
  forest: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#d8f3dc", "#1b4332"],
  sunset: ["#ff6b35", "#f7c59f", "#efa00b", "#d68c45", "#c44536", "#772e25", "#f0a500", "#ff8c00"],
  monochrome: ["#212529", "#495057", "#6c757d", "#adb5bd", "#ced4da", "#dee2e6", "#e9ecef", "#f8f9fa"],
  corporate: ["#2c3e50", "#3498db", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#27ae60"],
};

export const FONT_FAMILIES = [
  { label: "System Default", value: "inherit" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, sans-serif" },
];

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontSize: 14,
  fontFamily: "inherit",
  color: "#323039",
  isBold: false,
  isItalic: false,
  isUnderline: false,
};