import type { Metadata } from "next";
import { productSans } from "@/fonts"; //
import AuthProvider from "./providers/AuthProvider";
import SessionSync from "./_components/SessionSync";
import { GlobalLoader } from "./_components/GlobalLoader";
import "./globals.scss";

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
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <GlobalLoader />
          <SessionSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
