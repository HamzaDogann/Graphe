"use client";

import { useDatasetStore } from "@/store/useDatasetStore";
import WelcomeScreen from "./_features/Welcome/WelcomeScreen";
import ChatInterface from "./_features/chat/ChatInterface";

export default function HomePage() {
  // Store'dan sadece 'file' verisini dinliyoruz
  const file = useDatasetStore((state) => state.file);

  return <>{!file ? <WelcomeScreen /> : <ChatInterface />}</>;
}
