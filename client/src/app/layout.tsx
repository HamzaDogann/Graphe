import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.scss";
import AuthProvider from "./providers/AuthProvider";
import SessionSync from "./_components/SessionSync";

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
      path: "../fonts/ProductSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/ProductSans-Thin.ttf",
      weight: "300",
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
      <body>
        <AuthProvider>
          <SessionSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
