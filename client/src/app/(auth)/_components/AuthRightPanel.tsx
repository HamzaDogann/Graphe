"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./AuthRightPanel.module.scss";

interface SlideData {
  coloredText: string;
  normalText: string;
  coloredTextColor: string;
  alignment: "leftRight" | "rightLeft";
  images: {
    src: string;
    alt: string;
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  }[];
}

const slides: SlideData[] = [
  {
    coloredText: "Visualize",
    normalText: "Your Data",
    coloredTextColor: "#4f46e5",
    alignment: "leftRight",
    images: [
      { src: "/auth/chart-3d.svg", alt: "3D Chart", position: "topLeft" },
      { src: "/auth/pie-chart.svg", alt: "Pie Chart", position: "topRight" },
      {
        src: "/auth/line-chart.svg",
        alt: "Line Chart",
        position: "bottomLeft",
      },
      { src: "/auth/pencil-3d.svg", alt: "Pencil", position: "bottomRight" },
    ],
  },
  {
    coloredText: "Canvas",
    normalText: "Create Your",
    coloredTextColor: "#10b981",
    alignment: "rightLeft",
    images: [
      { src: "/auth/hand-select.svg", alt: "Hand Select", position: "topLeft" },
      { src: "/auth/bar-chart.svg", alt: "Bar Chart", position: "topRight" },
      { src: "/auth/printer-3d.svg", alt: "Printer", position: "bottomLeft" },
      { src: "/auth/easel.svg", alt: "Easel", position: "bottomRight" },
    ],
  },
  {
    coloredText: "Add Charts",
    normalText: "Edit. Print.",
    coloredTextColor: "#f59e0b",
    alignment: "leftRight",
    images: [
      { src: "/auth/hand-select.svg", alt: "Hand Select", position: "topLeft" },
      { src: "/auth/bar-chart.svg", alt: "Bar Chart", position: "topRight" },
      { src: "/auth/printer-3d.svg", alt: "Printer", position: "bottomLeft" },
      { src: "/auth/easel.svg", alt: "Easel", position: "bottomRight" },
    ],
  },
];

export function AuthRightPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);

      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(true);
      }, 800);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className={styles.rightPanel}>
      {/* Dot Pattern Background */}
      <div className={styles.dotPattern} />

      {/* Floating Images */}
      <div
        className={`${styles.imagesContainer} ${
          isAnimating ? styles.visible : styles.hidden
        }`}
      >
        {slide.images.map((img, index) => (
          <div
            key={`${currentSlide}-${index}`}
            className={`${styles.floatingImage} ${styles[img.position]}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={img.src}
                alt={img.alt}
                width={380}
                height={380}
                className={styles.image}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Text Content */}
      <div
        className={`${styles.textContent} ${
          isAnimating ? styles.visible : styles.hidden
        } ${styles[slide.alignment]}`}
      >
        <span className={styles.coloredTextWrapper}>
          <span className={styles.coloredTextGlow}>{slide.coloredText}</span>
          <span className={styles.coloredText}>{slide.coloredText}</span>
        </span>
        <span className={styles.normalText}>{slide.normalText}</span>
      </div>
    </div>
  );
}
