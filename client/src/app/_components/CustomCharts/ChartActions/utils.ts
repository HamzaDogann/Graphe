import { EXTENSION_LOGOS } from "./constants";

export const getExtensionLogo = (extension: string): string => {
  const ext = extension.toLowerCase();
  return EXTENSION_LOGOS[ext] || "/extensionsLogo/CsvLogo.png";
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};