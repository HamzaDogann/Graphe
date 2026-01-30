import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graphe - Transform Your Data into Insights",
  description:
    "Create beautiful charts and visualizations from your data with AI-powered analytics",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
