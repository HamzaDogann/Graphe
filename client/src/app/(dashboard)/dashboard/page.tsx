"use client";

import dynamic from "next/dynamic";
import { useDatasetStore } from "@/store/useDatasetStore";

// Shared loading component for dynamic imports
const DynamicLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      gap: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "3px solid #e2e8f0",
        borderTopColor: "#5C85FF",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 500 }}>
      Loading...
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Lazy load components for better performance
const WelcomeScreen = dynamic(
  () => import("@/app/(main)/_features/Welcome/WelcomeScreen"),
  {
    loading: () => <DynamicLoader />,
    ssr: false,
  },
);

const ChatInterface = dynamic(
  () => import("@/app/(main)/_features/chat/ChatInterface"),
  {
    loading: () => <DynamicLoader />,
    ssr: false,
  },
);

export default function DashboardPage() {
  const file = useDatasetStore((state) => state.file);

  return <>{!file ? <WelcomeScreen /> : <ChatInterface />}</>;
}
