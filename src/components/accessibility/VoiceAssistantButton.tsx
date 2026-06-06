// src/components/accessibility/VoiceAssistantButton.tsx
// Voice Health Assistant — floating mic button + modal with live transcription
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startListening,
  stopListening,
  speak,
  stopSpeaking,
  isListeningSupported,
  isSpeechSupported,
} from '@/lib/accessibility/speechService';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const processQuery = useCallback(async (userText: string) => {
    setVoiceState('processing');
    setHistory((prev) => [...prev, { role: 'user', text: userText }]);

    try {
      // Send to emergency triage first to check for emergencies
      const triageRes = await fetch('/api/emergency/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: userText, userDiseases: [] }),
      });

      let aiText = '';

      if (triageRes.ok) {
        const triage = await triageRes.json();
        if (triage.severity === 'HIGH') {
          aiText = triage.audioScript;
        } else {
          // For food-related queries, use a general response
          const lc = userText.toLowerCase();
          if (lc.includes('eat') || lc.includes('food') || lc.includes('meal') || lc.includes('injera') || lc.includes('diet')) {
            aiText = `I understand you're asking about food. Let me analyze that for you. For the most accurate nutritional analysis, please use the Food Scanner to take a photo. However, based on your query: "${userText}" — I recommend checking the calorie and nutrient information through our scanner feature. Would you like me to help with anything else?`;
          } else {
            aiText = triage.audioScript || `I heard: "${userText}". ${triage.instructions}`;
          }
        }
      } else {
        aiText = `I heard your question: "${userText}". For the most accurate health analysis, please use our Food Scanner for nutrition questions, or describe specific symptoms for medical triage.`;
      }

      setResponse(aiText);
      setHistory((prev) => [...prev, { role: 'ai', text: aiText }]);

      // Speak the response
      if (isSpeechSupported()) {
        setVoiceState('speaking');
        speak(aiText, 'en-US', () => {
          setVoiceState('idle');
        });
      } else {
        setVoiceState('idle');
      }
    } catch {
      const errText = 'Sorry, I could not process your request. Please try again.';
      setResponse(errText);
      setHistory((prev) => [...prev, { role: 'ai', text: errText }]);
      setVoiceState('idle');
    }

    // Auto scroll
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, []);

  const handleStartListening = useCallback(() => {
    if (!isListeningSupported()) {
      setResponse('Voice recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    stopSpeaking();
    setVoiceState('listening');
    setTranscript('');
    setResponse('');

    startListening(
      'en-US',
      (text) => {
        setTranscript(text);
        processQuery(text);
      },
      () => {
        if (voiceState === 'listening') setVoiceState('idle');
      },
      (err) => {
        console.error('Voice error:', err);
        setVoiceState('idle');
        setResponse('Could not understand. Please try again.');
      }
    );
  }, [processQuery, voiceState]);

  const handleStop = useCallback(() => {
    stopListening();
    stopSpeaking();
    setVoiceState('idle');
  }, []);

  const stateLabel = {
    idle: 'Tap to speak',
    listening: 'Listening...',
    processing: 'Processing...',
    speaking: 'Speaking...',
  };

  const stateIcon = {
    idle: 'mic',
    listening: 'hearing',
    processing: 'hourglass_top',
    speaking: 'volume_up',
  };

  return (
    <>
      {/* Floating Voice Button */}
      <motion.button
        id="voice-assistant-button"
        onClick={() => {
          setIsOpen(true);
          handleStartListening();
        }}
        className="fixed bottom-24 right-24 md:bottom-8 md:right-28 z-[99] w-14 h-14 rounded-full 
          bg-gradient-to-br from-primary to-emerald-600 text-on-primary shadow-2xl
          flex items-center justify-center cursor-pointer
          hover:from-emerald-400 hover:to-emerald-700 active:scale-95
          transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Voice Health Assistant - Tap to speak"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          mic
        </span>
      </motion.button>

      {/* Voice Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center"
            onClick={() => { setIsOpen(false); handleStop(); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-card rounded-t-3xl md:rounded-3xl p-6 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center companion-glow">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      assistant
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Voice Health Assistant</h2>
                    <p className="text-[11px] text-on-surface-variant">{stateLabel[voiceState]}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsOpen(false); handleStop(); }}
                  className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Chat History */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide min-h-[120px] max-h-[40vh]">
                {history.length === 0 && (
                  <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block text-primary/50">record_voice_over</span>
                    <p className="text-sm">Say something like:</p>
                    <p className="text-xs text-primary mt-1">&quot;Can I eat this food? I have diabetes.&quot;</p>
                    <p className="text-xs text-primary">&quot;Help, I feel dizzy&quot;</p>
                  </div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary/20 text-on-surface rounded-br-sm'
                          : 'bg-surface-container text-on-surface rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voice Visualizer */}
              <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                {voiceState === 'listening' && (
                  <div className="flex items-center gap-1 h-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="voice-wave-bar" />
                    ))}
                  </div>
                )}

                {voiceState === 'processing' && (
                  <div className="flex items-center gap-2 text-primary">
                    <motion.span
                      className="material-symbols-outlined"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      hourglass_top
                    </motion.span>
                    <span className="text-sm">Analyzing...</span>
                  </div>
                )}

                {voiceState === 'speaking' && (
                  <div className="flex items-center gap-2 text-primary">
                    <motion.span
                      className="material-symbols-outlined"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      volume_up
                    </motion.span>
                    <span className="text-sm">Speaking...</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  {voiceState === 'idle' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleStartListening}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-on-primary flex items-center justify-center shadow-xl cursor-pointer emerald-glow"
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        mic
                      </span>
                    </motion.button>
                  )}

                  {(voiceState === 'listening' || voiceState === 'speaking') && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleStop}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center shadow-xl cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        stop
                      </span>
                    </motion.button>
                  )}
                </div>

                <p className="text-[11px] text-on-surface-variant text-center">
                  {voiceState === 'idle' ? 'Tap the microphone to ask a health question' : stateLabel[voiceState]}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
