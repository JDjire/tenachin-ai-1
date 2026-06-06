"use client";

import { LanguageProvider } from "@/lib/LanguageContext";
import VoiceAssistant from "@/components/VoiceAssistant";

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      {children}
      <VoiceAssistant />
    </LanguageProvider>
  );
}
