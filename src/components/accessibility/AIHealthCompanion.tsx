// src/components/accessibility/AIHealthCompanion.tsx
// Friendly AI character with personalized health greetings and motivation
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CompanionProps {
  userName?: string;
  healthScore?: number;
  streakDays?: number;
  improvement?: number;
}

export default function AIHealthCompanion({
  userName = 'User',
  healthScore = 78,
  streakDays = 7,
  improvement = 12,
}: CompanionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const timeOfDay = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }, []);

  const tips = useMemo(() => [
    t('dashboard.companion_greeting', { timeOfDay, name: userName, improvement }),
    t('dashboard.streak_message', { days: streakDays }),
    'Remember to drink at least 8 glasses of water today. Staying hydrated helps manage blood sugar levels.',
    'Try adding vegetables to your next meal. Ethiopian greens like Gomen are excellent for heart health.',
    'A 15-minute walk after meals can significantly help regulate blood sugar levels.',
  ], [t, timeOfDay, userName, improvement, streakDays]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <motion.div
      layout
      className="glass-card rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        {/* Companion Header */}
        <div className="flex items-center gap-3">
          {/* Avatar with glow */}
          <motion.div
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-emerald-600/30 flex items-center justify-center companion-glow flex-shrink-0"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-primary">{t('companion.name')}</h3>
              <span className="text-[9px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">{t('companion.role')}</p>
          </div>

          <motion.span
            className="material-symbols-outlined text-on-surface-variant text-sm"
            animate={{ rotate: isExpanded ? 180 : 0 }}
          >
            expand_more
          </motion.span>
        </div>

        {/* Current Tip (always visible) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 bg-surface-container rounded-xl p-3"
          >
            <p className="text-sm text-on-surface leading-relaxed">{tips[currentTip]}</p>
          </motion.div>
        </AnimatePresence>

        {/* Tip indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentTip(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                i === currentTip ? 'bg-primary w-4' : 'bg-on-surface-variant/30'
              }`}
              aria-label={`View tip ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Expanded Stats */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/5">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-primary">{healthScore}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">{t('dashboard.score')}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{streakDays}d</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">{t('dashboard.streak')}</p>
                </div>
                <div className="bg-surface-container rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-400">+{improvement}%</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Progress</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
