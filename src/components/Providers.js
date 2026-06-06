"use client";

import { LanguageProvider } from "@/lib/LanguageContext";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useEffect } from "react";
import { DatabaseService } from "@/utils/services";
import PropTypes from 'prop-types';

export default function Providers({ children }) {
  useEffect(() => {
    // Ensure mock localStorage data is seeded for demo/login flows
    try {
      DatabaseService.init();
    } catch (e) {
      // Log initialization problems so developers can see failures
      // but do not rethrow to avoid breaking the app shell during hydration
      // eslint-disable-next-line no-console
      console.warn('DatabaseService.init() failed during Providers mount:', e);
    }
  }, []);
  return (
    <LanguageProvider>
      {children}
      <VoiceAssistant />
    </LanguageProvider>
  );
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
