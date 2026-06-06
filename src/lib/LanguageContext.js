"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const storedLang = window.localStorage.getItem("tenachin-lang");
    if (storedLang && translations[storedLang]) {
      setLangState(storedLang);
    }
  }, []);

  const setLang = (code) => {
    if (!translations[code]) return;
    setLangState(code);
    window.localStorage.setItem("tenachin-lang", code);
  };

  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return context;
}
