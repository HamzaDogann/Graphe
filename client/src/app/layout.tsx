import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.scss";

const productSans = localFont({
  src: [
    {
      path: "../fonts/ProductSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ProductSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/ProductSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/ProductSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-product-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Graphe",
  description: "Graphe Client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={productSans.variable}>
      <body>{children}</body>
    </html>
  );
}
