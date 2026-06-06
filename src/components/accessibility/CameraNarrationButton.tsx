// src/components/accessibility/CameraNarrationButton.tsx
// Camera Narration Mode — point camera at food, AI speaks description
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startCamera, stopCamera, captureFrameAsync, narrateFrame } from '@/lib/accessibility/cameraService';
import { speak, stopSpeaking } from '@/lib/accessibility/speechService';
import type { NarrationResult } from '@/lib/accessibility/cameraService';

type NarrationState = 'idle' | 'camera' | 'analyzing' | 'narrating';

export default function CameraNarrationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<NarrationState>('idle');
  const [result, setResult] = useState<NarrationResult | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await startCamera(videoRef.current, 'environment');
      setState('camera');
    } catch {
      speak('Could not access camera. Please check your permissions.', 'en-US');
    }
  }, []);

  const captureAndNarrate = useCallback(async () => {
    if (!videoRef.current) return;
    setState('analyzing');

    const blob = await captureFrameAsync(videoRef.current);
    if (!blob) {
      speak('Could not capture image. Please try again.', 'en-US');
      setState('camera');
      return;
    }

    const narration = await narrateFrame(blob);
    setResult(narration);
    setState('narrating');

    // Speak the narration
    speak(narration.narration, 'en-US', () => {
      setState('camera');
    });
  }, []);

  // Auto-narration mode — capture every 5 seconds
  useEffect(() => {
    if (autoMode && state === 'camera') {
      intervalRef.current = setInterval(() => {
        captureAndNarrate();
      }, 6000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoMode, state, captureAndNarrate]);

  const handleClose = useCallback(() => {
    stopCamera();
    stopSpeaking();
    setAutoMode(false);
    setState('idle');
    setResult(null);
    setIsOpen(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      openCamera();
    }
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, openCamera]);

  const riskColor = (level: string) => {
    switch (level) {
      case 'SAFE': return 'text-green-400';
      case 'CAUTION': return 'text-amber-400';
      case 'RISK': return 'text-red-400';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <>
      {/* Camera Narration FAB */}
      <motion.button
        id="camera-narration-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 md:bottom-8 md:left-72 z-[99] w-14 h-14 rounded-full 
          bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-2xl
          flex items-center justify-center cursor-pointer
          hover:from-violet-400 hover:to-indigo-700 active:scale-95
          transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Camera Narration Mode - Point camera at food for AI description"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          photo_camera
        </span>
      </motion.button>

      {/* Camera Narration Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* Camera View */}
            <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />

              {/* Overlay controls */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center">
                <div>
                  <h2 className="text-white font-bold text-lg">Camera Narration</h2>
                  <p className="text-white/70 text-xs">Point at food for AI analysis</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>

              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/30 rounded-3xl" />
              </div>

              {/* Status indicator */}
              {state === 'analyzing' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Bottom Panel */}
            <div className="bg-surface-container p-4 pb-8 space-y-4">
              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-container-high rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-on-surface">{result.food_name}</h3>
                    <span className={`text-xs font-bold uppercase ${riskColor(result.risk_level)}`}>
                      {result.risk_level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                    <span>🔥 {result.calories} cal</span>
                  </div>
                  {state === 'narrating' && (
                    <div className="flex items-center gap-2 mt-2 text-primary">
                      <motion.span
                        className="material-symbols-outlined text-sm"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        volume_up
                      </motion.span>
                      <span className="text-xs">Speaking...</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                {/* Auto mode toggle */}
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    autoMode
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {autoMode ? 'autoplay' : 'play_arrow'}
                  </span>
                  {autoMode ? 'Auto ON' : 'Auto OFF'}
                </button>

                {/* Manual capture */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={captureAndNarrate}
                  disabled={state === 'analyzing'}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-on-primary flex items-center justify-center shadow-xl cursor-pointer emerald-glow disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {state === 'analyzing' ? 'hourglass_top' : 'camera'}
                  </span>
                </motion.button>

                {/* Close */}
                <button
                  onClick={handleClose}
                  className="px-5 py-3 rounded-2xl bg-surface-container-high text-on-surface-variant text-sm font-semibold cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
