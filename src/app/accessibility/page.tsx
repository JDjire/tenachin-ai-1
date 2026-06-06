// src/app/accessibility/page.tsx
// Accessibility Dashboard — Vision, Hearing, Mobility assistance + Language selection
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/lib/accessibility/AccessibilityContext';
import { LANGUAGES, type LanguageCode } from '@/lib/accessibility/i18n';
import { useTranslation } from 'react-i18next';

function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  icon,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  icon: string;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-colors group cursor-pointer"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          enabled ? 'bg-primary/20' : 'bg-surface-container-high'
        }`}>
          <span className={`material-symbols-outlined text-lg transition-colors ${
            enabled ? 'text-primary' : 'text-on-surface-variant'
          }`} style={{ fontVariationSettings: enabled ? "'FILL' 1" : undefined }}>
            {icon}
          </span>
        </div>
        <div className="text-left">
          <p className={`text-sm font-semibold transition-colors ${enabled ? 'text-primary' : 'text-on-surface'}`}>
            {label}
          </p>
          {description && (
            <p className="text-[11px] text-on-surface-variant mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Toggle Pill */}
      <div className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-surface-container-highest'
      }`}>
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? 24 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

function FontScaleSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const scales = [1, 1.15, 1.3, 1.5];
  const labels = ['A', 'A+', 'A++', 'A+++'];

  return (
    <div className="p-4 bg-surface-container rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            text_increase
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">Text Size</p>
          <p className="text-[11px] text-on-surface-variant">Adjust text size across the app</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {scales.map((scale, i) => (
          <button
            key={scale}
            onClick={() => onChange(scale)}
            className={`flex-1 py-2.5 rounded-xl text-center font-bold transition-all cursor-pointer ${
              value === scale
                ? 'bg-primary text-on-primary shadow-lg'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
            style={{ fontSize: `${12 + i * 2}px` }}
          >
            {labels[i]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AccessibilityDashboard() {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (code: LanguageCode) => {
    updateSetting('language', code);
    i18n.changeLanguage(code);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-on-surface mb-1">{t('a11y.title')}</h1>
        <p className="text-sm text-on-surface-variant">
          Customize your experience to match your accessibility needs
        </p>
      </motion.div>

      {/* ─── Vision Assistance ──────────────────────────── */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            visibility
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">{t('a11y.vision')}</h2>
        </div>

        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.highContrast}
            onChange={(v) => updateSetting('highContrast', v)}
            label={t('a11y.high_contrast')}
            description="Increase color contrast for better visibility"
            icon="contrast"
          />
          <FontScaleSlider
            value={settings.fontScale}
            onChange={(v) => updateSetting('fontScale', v)}
          />
          <ToggleSwitch
            enabled={settings.voiceNavigation}
            onChange={(v) => updateSetting('voiceNavigation', v)}
            label={t('a11y.voice_nav')}
            description="Navigate the app using voice commands"
            icon="record_voice_over"
          />
          <ToggleSwitch
            enabled={settings.screenReaderOptimized}
            onChange={(v) => updateSetting('screenReaderOptimized', v)}
            label={t('a11y.screen_reader')}
            description="Optimize layout for screen reader software"
            icon="accessibility_new"
          />
        </div>
      </motion.section>

      {/* ─── Hearing Assistance ─────────────────────────── */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            hearing
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-secondary">{t('a11y.hearing')}</h2>
        </div>

        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.visualAlerts}
            onChange={(v) => updateSetting('visualAlerts', v)}
            label={t('a11y.visual_alerts')}
            description="Flash visual indicators instead of sound alerts"
            icon="notifications_active"
          />
          <ToggleSwitch
            enabled={settings.captionsEnabled}
            onChange={(v) => updateSetting('captionsEnabled', v)}
            label={t('a11y.captions')}
            description="Show text captions for AI voice responses"
            icon="closed_caption"
          />
          <ToggleSwitch
            enabled={settings.textBasedResponses}
            onChange={(v) => updateSetting('textBasedResponses', v)}
            label={t('a11y.text_responses')}
            description="AI responses displayed as text only (no audio)"
            icon="text_fields"
          />
        </div>
      </motion.section>

      {/* ─── Mobility Assistance ────────────────────────── */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            accessibility
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-tertiary">{t('a11y.mobility')}</h2>
        </div>

        <div className="space-y-2">
          <ToggleSwitch
            enabled={settings.voiceOnlyMode}
            onChange={(v) => updateSetting('voiceOnlyMode', v)}
            label={t('a11y.voice_only')}
            description="Control the entire app using only voice commands"
            icon="settings_voice"
          />
          <ToggleSwitch
            enabled={settings.largeButtons}
            onChange={(v) => updateSetting('largeButtons', v)}
            label={t('a11y.large_buttons')}
            description="Increase tap target size for all buttons"
            icon="open_with"
          />
          <ToggleSwitch
            enabled={settings.simplifiedNav}
            onChange={(v) => updateSetting('simplifiedNav', v)}
            label={t('a11y.simple_nav')}
            description="Reduce animations and simplify navigation"
            icon="view_compact"
          />
        </div>
      </motion.section>

      {/* ─── Language Selection ─────────────────────────── */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            translate
          </span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">{t('a11y.language')}</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex flex-col items-center py-4 px-3 rounded-2xl transition-all cursor-pointer ${
                settings.language === lang.code
                  ? 'bg-primary/20 border-2 border-primary shadow-lg'
                  : 'bg-surface-container border-2 border-transparent hover:bg-surface-container-high'
              }`}
            >
              <span className={`text-lg font-bold mb-1 ${
                settings.language === lang.code ? 'text-primary' : 'text-on-surface'
              }`}>
                {lang.nativeLabel}
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ─── Reset Button ──────────────────────────────── */}
      <motion.div variants={itemVariants} className="pt-4 pb-8">
        <button
          onClick={resetSettings}
          className="w-full py-3 bg-surface-container text-on-surface-variant rounded-2xl text-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          Reset to Default Settings
        </button>
      </motion.div>
    </motion.div>
  );
}
