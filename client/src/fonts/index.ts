import localFont from "next/font/local";

export const productSans = localFont({
  src: [
    {
      path: "./ProductSans-Regular.ttf", 
      weight: "400",
      style: "normal",
    },
    {
      path: "./ProductSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./ProductSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./ProductSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./ProductSans-Thin.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./ProductSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-product-sans",
  display: "swap",
});