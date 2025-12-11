"use client";

import { useState } from "react";
import WelcomeScreen from "./WelcomeScreen";
import ChatInterface from "./(chat)/ChatInterface";

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    // Burada dosyayı state'e atıyoruz.
    // İleride burada backend'e upload işlemi başlatılabilir.
    setUploadedFile(file);
  };

  return (
    <>
      {/* Dosya yüklenmemişse WelcomeScreen, yüklenmişse ChatInterface */}
      {!uploadedFile ? (
        <WelcomeScreen onFileUpload={handleFileUpload} />
      ) : (
        <ChatInterface uploadedFile={uploadedFile} />
      )}
    </>
  );
}
