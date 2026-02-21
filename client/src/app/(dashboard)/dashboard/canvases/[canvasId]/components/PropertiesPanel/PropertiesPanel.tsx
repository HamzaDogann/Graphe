"use client";

import { useState } from "react";
import { FileText, Type, BarChart3, Image, Pencil, Shapes } from "lucide-react";
import { ActivePropertyMenu } from "../ActivePropertyMenu";
import {
  PageContent,
  TextContent,
  ChartsContent,
  ImageContent,
  DrawContent,
  ShapesContent,
} from "../PropertyContents";
import styles from "./PropertiesPanel.module.scss";

type PropertyType =
  | "page"
  | "text"
  | "charts"
  | "image"
  | "draw"
  | "shapes"
  | null;

interface PropertyMenuItem {
  id: PropertyType;
  icon: React.ReactNode;
  label: string;
  description: string;
  content: React.ReactNode;
}

const propertyMenuItems: PropertyMenuItem[] = [
  {
    id: "page",
    icon: <FileText size={22} />,
    label: "Page",
    description: "Page size, orientation and background settings",
    content: <PageContent />,
  },
  {
    id: "text",
    icon: <Type size={22} />,
    label: "Text",
    description: "Add and style text elements",
    content: <TextContent />,
  },
  {
    id: "charts",
    icon: <BarChart3 size={22} />,
    label: "Charts",
    description: "Create charts and data visualizations",
    content: <ChartsContent />,
  },
  {
    id: "image",
    icon: <Image size={22} />,
    label: "Image",
    description: "Add image to your canvas",
    content: <ImageContent />,
  },
  {
    id: "draw",
    icon: <Pencil size={22} />,
    label: "Draw",
    description: "Freehand drawing tools",
    content: <DrawContent />,
  },
  {
    id: "shapes",
    icon: <Shapes size={22} />,
    label: "Shapes",
    description: "Add geometric shapes",
    content: <ShapesContent />,
  },
];

export const PropertiesPanel = () => {
  const [activeProperty, setActiveProperty] = useState<PropertyType>(null);

  const handlePropertyClick = (propertyId: PropertyType) => {
    if (activeProperty === propertyId) {
      setActiveProperty(null);
    } else {
      setActiveProperty(propertyId);
    }
  };

  const handleCloseMenu = () => {
    setActiveProperty(null);
  };

  const activeItem = propertyMenuItems.find(
    (item) => item.id === activeProperty,
  );

  return (
    <aside className={styles.propertiesPanel}>
      {/* Active Property Menu - Opens to the left */}
      <ActivePropertyMenu
        isOpen={activeProperty !== null}
        title={activeItem?.label || ""}
        description={activeItem?.description}
        onClose={handleCloseMenu}
      >
        {activeItem?.content}
      </ActivePropertyMenu>

      {/* Icon Menu */}
      <div className={styles.iconMenu}>
        {propertyMenuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.iconButton} ${
              activeProperty === item.id ? styles.active : ""
            }`}
            onClick={() => handlePropertyClick(item.id)}
            aria-label={item.label}
            title={item.label}
          >
            {item.icon}
            <span className={styles.iconLabel}>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
