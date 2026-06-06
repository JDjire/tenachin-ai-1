// src/components/accessibility/SOSFloatingButton.tsx
// One-tap emergency SOS button — persistent floating action button
'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/accessibility/speechService';
import {
  ETHIOPIA_EMERGENCY_CONTACTS,
  triggerSOS,
  getCurrentLocation,
} from '@/lib/accessibility/emergencyService';

export default function SOSFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [sosData, setSosData] = useState<{
    contacts: typeof ETHIOPIA_EMERGENCY_CONTACTS;
    locationText: string;
    message: string;
  } | null>(null);

  const handleSOS = useCallback(async () => {
    setIsTriggered(true);

    // Speak emergency message
    speak('Emergency SOS activated. Contacting emergency services and sharing your location.', 'en-US');

    const data = await triggerSOS(ETHIOPIA_EMERGENCY_CONTACTS);
    setSosData(data);
    setIsOpen(true);

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    setTimeout(() => setIsTriggered(false), 3000);
  }, []);

  const openDirections = useCallback(async () => {
    try {
      const pos = await getCurrentLocation();
      const url = `https://www.google.com/maps/search/hospital/@${pos.coords.latitude},${pos.coords.longitude},14z`;
      window.open(url, '_blank');
    } catch {
      window.open('https://www.google.com/maps/search/hospital/', '_blank');
    }
  }, []);

  const callNumber = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <>
      {/* SOS Floating Button */}
      <motion.button
        id="sos-floating-button"
        onClick={handleSOS}
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] w-16 h-16 rounded-full 
          bg-gradient-to-br from-red-500 to-red-700 text-white shadow-2xl
          flex items-center justify-center cursor-pointer
          hover:from-red-600 hover:to-red-800 active:scale-95
          transition-all duration-200 sos-pulse`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Emergency SOS - Press for immediate help"
        role="button"
      >
        <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
          emergency
        </span>
      </motion.button>

      {/* SOS Label */}
      <div className="fixed bottom-[5.5rem] right-4 md:bottom-[4.5rem] md:right-8 z-[99] text-[9px] font-bold uppercase tracking-widest text-red-400 text-center w-16">
        SOS
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => { setIsOpen(false); stopSpeaking(); }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card rounded-3xl p-6 border-red-500/30 border"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emergency
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-400">Emergency SOS</h2>
                  <p className="text-xs text-on-surface-variant">
                    {isTriggered ? 'Sending emergency alert...' : 'Emergency contacts & hospital directions'}
                  </p>
                </div>
              </div>

              {/* Location */}
              {sosData && (
                <div className="bg-surface-container rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">my_location</span>
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Your Location</span>
                  </div>
                  <p className="text-sm text-on-surface font-mono">{sosData.locationText}</p>
                </div>
              )}

              {/* Emergency Contacts */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Emergency Contacts</p>
                {ETHIOPIA_EMERGENCY_CONTACTS.map((contact, i) => (
                  <button
                    key={i}
                    onClick={() => callNumber(contact.number)}
                    className="w-full flex items-center justify-between bg-surface-container-high hover:bg-surface-container rounded-xl p-3 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-400 group-hover:text-red-300">call</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-on-surface">{contact.label}</p>
                        <p className="text-xs text-on-surface-variant">{contact.number}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={openDirections}
                  className="flex items-center justify-center gap-2 bg-primary/20 text-primary rounded-xl py-3 font-semibold text-sm hover:bg-primary/30 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">directions</span>
                  Hospital Route
                </button>
                <button
                  onClick={() => { setIsOpen(false); stopSpeaking(); }}
                  className="flex items-center justify-center gap-2 bg-surface-container text-on-surface-variant rounded-xl py-3 font-semibold text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
