"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

const pageDescriptions = {
  "/login": "You are on the Login page. Sign in with email and password.",
  "/onboarding": "You are on the Onboarding wizard. Enter age, weight and height.",
  "/": "You are on the Dashboard. Scan food and check your leaderboard.",
  "/dashboard": "You are on the Dashboard. Scan food and check your leaderboard.",
  "/analytics": "You are on Health Analytics. View your 7-day compliance chart.",
  "/triage": "You are on Triage. Describe symptoms to the AI chatbot.",
  "/chatbot": "You are on Triage. Describe symptoms to the AI chatbot.",
  "/admin": "You are on the Clinical Admin Portal. View patient records.",
  "/emergency": "You are on Emergency Numbers. Tap any number to call.",
  "/payment": "You are on Payment. Choose a plan and pay with Telebirr or M-Pesa.",
  "/ai-assistant": "You are on the AI Assistant. Ask any health question."
};

const languageConfig = {
  en: { recognition: "en-US", synthesis: "en-US" },
  am: { recognition: "am-ET", synthesis: "am-ET" },
  or: { recognition: "om-ET", synthesis: "om-ET" }
};

export default function VoiceAssistant() {
  const { t, lang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageConfig[lang]?.recognition || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const spoken = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setTranscript(spoken);

      const command = spoken.toLowerCase();
      const goTo = (path) => {
        router.push(path);
        setPanelOpen(false);
      };

      if (/(stop|quiet)/.test(command)) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      } else if (/(dashboard)/.test(command)) {
        goTo("/");
      } else if (/(triage|symptoms)/.test(command)) {
        goTo("/chatbot");
      } else if (/(analytics|health report)/.test(command)) {
        goTo("/analytics");
      } else if (/(emergency numbers|ambulance)/.test(command)) {
        goTo("/emergency");
      } else if (/(payment|upgrade)/.test(command)) {
        goTo("/payment");
      } else if (/(ai assistant)/.test(command)) {
        goTo("/ai-assistant");
      } else if (/(read page|describe page)/.test(command)) {
        const description = pageDescriptions[pathname] || "You are on a page in Tenachin AI.";
        speakText(description);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang, pathname, router]);

  const speakText = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageConfig[lang]?.synthesis || "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setListening(true);
    recognitionRef.current.lang = languageConfig[lang]?.recognition || "en-US";
    recognitionRef.current.start();
  }, [lang]);

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    setListening(false);
    setSpeaking(false);
  };

  if (!supported) {
    return null;
  }

  const statusLabel = listening ? t("listening") : speaking ? t("speaking") : "Idle";

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      {panelOpen && (
        <div className="mb-4 w-72 rounded-2xl border border-white/10 bg-background/90 p-4 shadow-2xl backdrop-blur-2xl glass-card text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold">{t("voiceAssistant")}</h2>
              <p className="text-xs text-on-surface-variant">{t("askAnything")}</p>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded-full bg-white/10 p-1 text-white hover:bg-white/20"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-surface-container/70 p-3 text-xs text-on-surface-variant">
              <span className="font-semibold">Status:</span> {statusLabel}
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface-container/80 p-3 min-h-[72px] text-sm text-white">
              {transcript || "..."}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startListening}
                className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                <span className="material-symbols-outlined text-base">mic</span>
                <span>{t("speakNow")}</span>
              </button>
              <button
                type="button"
                onClick={stopListening}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">stop</span>
                <span>{t("stopListening")}</span>
              </button>
              <button
                type="button"
                onClick={() => speakText(pageDescriptions[pathname] || "You are on a page in Tenachin AI.")}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-base">volume_up</span>
                <span>{t("routeNow")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setPanelOpen((value) => !value)}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 shadow-2xl transition ${listening ? 'bg-red-500 animate-pulse' : 'bg-[#4edea3]'}`}
        aria-label="Open Voice Assistant"
      >
        <span className="material-symbols-outlined text-2xl text-black">
          {listening ? 'mic' : 'accessibility_new'}
        </span>
      </button>
    </div>
  );
}
