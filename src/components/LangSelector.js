"use client";

import React, { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "@/lib/i18n";
import { useLang } from "@/lib/LanguageContext";

export default function LangSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentLanguage = LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-container/80 px-3 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-xl transition hover:bg-white/10"
      >
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline-block">{currentLanguage.native}</span>
        <span className="material-symbols-outlined text-sm">expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-surface-container/90 backdrop-blur-2xl shadow-2xl p-2 glass-card z-50">
          {LANGUAGES.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                setLang(option.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10 ${lang === option.code ? 'bg-primary/10 text-primary' : 'text-white'}`}
            >
              <span>{option.flag}</span>
              <div className="flex-1">
                <div className="font-semibold">{option.native}</div>
                <div className="text-xs text-on-surface-variant">{option.label}</div>
              </div>
              {lang === option.code && <span className="material-symbols-outlined text-sm">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
