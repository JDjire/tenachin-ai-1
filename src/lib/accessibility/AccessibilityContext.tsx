// src/lib/accessibility/AccessibilityContext.tsx
// React context for managing accessibility preferences app-wide
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { LanguageCode } from './i18n';

export interface AccessibilitySettings {
  // Vision
  highContrast: boolean;
  largeText: boolean;
  voiceNavigation: boolean;
  screenReaderOptimized: boolean;
  // Hearing
  visualAlerts: boolean;
  captionsEnabled: boolean;
  textBasedResponses: boolean;
  // Mobility
  voiceOnlyMode: boolean;
  largeButtons: boolean;
  simplifiedNav: boolean;
  // Language
  language: LanguageCode;
  // Font scale (1 = normal, 1.25, 1.5, 2)
  fontScale: number;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  voiceNavigation: false,
  screenReaderOptimized: false,
  visualAlerts: false,
  captionsEnabled: false,
  textBasedResponses: false,
  voiceOnlyMode: false,
  largeButtons: false,
  simplifiedNav: false,
  language: 'en',
  fontScale: 1,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
}

const AccessibilityCtx = createContext<AccessibilityContextType>({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
  resetSettings: () => {},
});

const STORAGE_KEY = 'tenachin-a11y-settings';

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings, loaded]);

  // Apply CSS side effects
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);

    // Font scale
    root.style.setProperty('--a11y-font-scale', String(settings.fontScale));
    root.style.fontSize = `${settings.fontScale * 100}%`;

    // Large buttons class
    root.classList.toggle('a11y-large-buttons', settings.largeButtons);

    // Simplified nav
    root.classList.toggle('a11y-simplified', settings.simplifiedNav);

    // Reduced motion
    if (settings.simplifiedNav) {
      root.style.setProperty('--a11y-transition', 'none');
    } else {
      root.style.removeProperty('--a11y-transition');
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AccessibilityCtx.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityCtx.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityCtx);
}

export default AccessibilityCtx;
