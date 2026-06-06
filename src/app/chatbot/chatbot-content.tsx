'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '@/utils/services';
import { Profile, SeverityLevel } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  severity?: SeverityLevel;
  condition?: string;
  needsHospital?: boolean;
}

export default function ChatbotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<Profile | null>(null);
  const [userDiseases, setUserDiseases] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>({
    name: 'Black Lion Hospital',
    distance: '1.2 km',
    duration: '5 min drive',
    phone: '+251 11 551 1211',
    directions: 'Take Churchill Ave, turn right at Tikur Anbessa St.',
    tag: 'FASTEST',
    coords: { top: '35%', left: '42%' }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if routed with emergency query parameter (e.g. from Triage Button)
  useEffect(() => {
    async function loadData() {
      const currUser = await DatabaseService.getCurrentUser();
      if (!currUser) {
        router.push('/login');
        return;
      }
      setUser(currUser);
      const diseases = await DatabaseService.getUserDiseases(currUser.id);
      setUserDiseases(diseases);

      // Welcome message
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello ${currUser.full_name?.split(' ')[0] || 'Patient'}. I am the Tenachin clinical triage assistant. How are you feeling today? Please describe your symptoms.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      const triggerEmergency = searchParams.get('emergency') === 'true';
      if (triggerEmergency) {
        handleTriggerEmergencyMock();
      }
    }
    loadData();
  }, [searchParams, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleTriggerEmergencyMock = () => {
    setEmergencyActive(true);
    setMessages(prev => [
      ...prev,
      {
        id: `mock-user-em`,
        sender: 'user',
        text: 'Feeling extremely dizzy, heavily sweating, blurred vision',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: `mock-ai-em`,
        sender: 'ai',
        text: 'Potential Hypoglycemia detected. Your symptoms (dizziness, diaphoresis, visual disturbance) require immediate attention.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: 'HIGH',
        condition: 'Hypoglycemia',
        needsHospital: true
      }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: userMsg.text,
          userDiseases,
          userId: user.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: data.recommendation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          severity: data.severity,
          condition: data.possible_condition,
          needsHospital: data.needs_hospital
        };
        setMessages(prev => [...prev, aiMsg]);

        if (data.severity === 'HIGH' || data.needs_hospital) {
          setEmergencyActive(true);
        }
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setLoading(false);
    }
  };

  const hospitalsList = [
    {
      name: 'Black Lion Hospital',
      distance: '1.2 km',
      duration: '5 min drive',
      phone: '+251 11 551 1211',
      directions: 'Take Churchill Ave, turn right at Tikur Anbessa St.',
      tag: 'FASTEST',
      coords: { top: '35%', left: '42%' }
    },
    {
      name: "St. Paul's Hospital",
      distance: '2.8 km',
      duration: '8 min drive',
      phone: '+251 11 275 0125',
      directions: 'Head north on Swaziland St towards St. Paul.',
      tag: 'NORMAL',
      coords: { top: '55%', left: '62%' }
    },
    {
      name: 'Addis General Clinic',
      distance: '3.5 km',
      duration: '12 min drive',
      phone: '+251 11 662 4545',
      directions: 'Drive towards Bole road, turn right at General Clinic St.',
      tag: 'NORMAL',
      coords: { top: '75%', left: '20%' }
    }
  ];

  return (
    <div className="h-[82vh] flex flex-col md:flex-row gap-6 overflow-hidden">
      
      {/* Left Pane: Chat Thread */}
      <section className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">Triage Chatbot</h1>
          <p className="text-xs text-on-surface-variant">AI-Powered Symptom Assessment & Emergency Detection</p>
        </header>

        <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
          
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              const isHighEmergency = msg.severity === 'HIGH';

              return (
                <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi ? (
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                        <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          smart_toy
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className={`p-4 rounded-2xl rounded-tl-none border border-white/5 text-sm leading-relaxed ${
                          isHighEmergency 
                            ? 'bg-surface-container-high text-on-surface glow-error border-error-container/30' 
                            : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {isHighEmergency && (
                            <div className="flex items-center gap-1 text-error font-bold mb-2">
                              <span className="material-symbols-outlined text-sm">warning</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider">High Emergency Level</span>
                            </div>
                          )}
                          <p>{msg.text}</p>
                          {msg.condition && (
                            <p className="text-xs text-on-surface-variant mt-2">
                              Possible Condition: <span className="text-primary font-bold">{msg.condition}</span>
                            </p>
                          )}
                        </div>
                        <span className="block text-[9px] opacity-65 pl-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[80%] bg-secondary-container text-on-secondary-container p-4 rounded-2xl rounded-tr-none shadow-sm">
                      <p className="text-sm">{msg.text}</p>
                      <span className="block text-[9px] mt-1.5 opacity-60 text-right">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Mapping Status indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Triage Engine Working...</span>
                  </div>
                </div>
              </div>
            )}

            {emergencyActive && !loading && (
              <div className="flex justify-center py-2 animate-bounce">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-error/15 rounded-full border border-error/30 ruby-glow">
                  <div className="w-2.5 h-2.5 bg-error rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-error">AI IS MAPPING NEAREST CLINICS...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-white/10 bg-surface-dim">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-background border border-white/10 rounded-xl px-4 py-2 focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-white transition-colors">
                attach_file
              </span>
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={emergencyActive ? "Describe any further symptoms..." : "e.g., Feeling extremely dizzy and heavily sweating..."}
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant h-10 outline-none"
              />
              <button 
                type="submit"
                className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined font-bold">send</span>
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Right Pane: Map & Facilities */}
      <section className="w-full md:w-[380px] flex flex-col gap-4 h-full overflow-hidden">
        
        {/* Interactive Map card */}
        <div className="glass-card flex-1 rounded-2xl overflow-hidden flex flex-col relative group border-white/10">
          
          {/* Map Image container */}
          <div className="flex-1 relative bg-surface-container-highest overflow-hidden">
            <img 
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[4000ms]" 
              alt="Vector dark-mode map of Addis Ababa with highlighted routes" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIhBD4fVK78zDKFr7rbrIu0DIWeM_cMbuRs-lAfQGp18_9E8hDNKSymKTmeZZWlmZQBPmcrUvc9lnudllK8wyyCZHVzeDw1O_eTLUeRo1krhdd0zOcV0lVXiMilmjAdkmgWoUGiXC8DCOY0srLrrpneTyd27Kxgrpaku9985td0-7kQe33BObf0Iep_eP9MHr1vCIAz5tHtwtYYclMzKrzJ6jIO0rSWGf_0zV0ALn10b84QrN0QwSJSxbpc1LLpoZCR7WZvQVjaGeG"
            />
            
            {/* Visual routing paths layer (emerald glowing routing trace) */}
            {emergencyActive && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Emerald route curve */}
                <path 
                  d="M 20 75 Q 35 45, 42 35" 
                  fill="none" 
                  stroke="#4edea3" 
                  strokeWidth="2.5" 
                  className="vitals-line drop-shadow-[0_0_8px_rgba(78,222,163,0.8)]"
                />
                <circle cx="20" cy="75" r="4" fill="#fc7c78" className="animate-pulse" />
                <circle cx="42" cy="35" r="5" fill="#4edea3" className="animate-pulse" />
              </svg>
            )}

            {/* Floating Clinic Pin 1 */}
            <div 
              style={{ top: '35%', left: '42%' }}
              onClick={() => setSelectedHospital(hospitalsList[0])}
              className={`absolute p-1.5 rounded-lg shadow-xl flex items-center gap-1.5 cursor-pointer transition-all border ${
                selectedHospital.name === 'Black Lion Hospital'
                  ? 'glass-card border-primary/50 bg-black/40 scale-105' 
                  : 'bg-black/60 border-white/10 scale-95 opacity-60'
              }`}
            >
              <div className="w-2 h-2 bg-primary rounded-full glow-emerald"></div>
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">Black Lion Hospital</span>
            </div>

            {/* Floating Clinic Pin 2 */}
            <div 
              style={{ top: '55%', left: '62%' }}
              onClick={() => setSelectedHospital(hospitalsList[1])}
              className={`absolute p-1.5 rounded-lg shadow-xl flex items-center gap-1.5 cursor-pointer transition-all border ${
                selectedHospital.name === "St. Paul's Hospital"
                  ? 'glass-card border-primary/50 bg-black/40 scale-105' 
                  : 'bg-black/60 border-white/10 scale-95 opacity-60'
              }`}
            >
              <div className="w-2 h-2 bg-primary rounded-full glow-emerald"></div>
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">St. Paul's Center</span>
            </div>

            {/* Floating Clinic Pin 3 */}
            <div 
              style={{ top: '75%', left: '20%' }}
              onClick={() => setSelectedHospital(hospitalsList[2])}
              className={`absolute p-1.5 rounded-lg shadow-xl flex items-center gap-1.5 cursor-pointer transition-all border ${
                selectedHospital.name === 'Addis General Clinic'
                  ? 'glass-card border-primary/50 bg-black/40 scale-105' 
                  : 'bg-black/60 border-white/10 scale-95 opacity-60'
              }`}
            >
              <div className="w-2 h-2 bg-primary rounded-full glow-emerald"></div>
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">Addis Gen Clinic</span>
            </div>

            {/* Map Overlay bottom UI */}
            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-background to-transparent">
              <div className="bg-surface-container p-4 rounded-xl border border-white/10 shadow-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedHospital.name}</h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {selectedHospital.distance} away • {selectedHospital.duration} • ER Open
                    </p>
                  </div>
                  <div className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                    {selectedHospital.tag}
                  </div>
                </div>
                <a 
                  href={`tel:${selectedHospital.phone}`}
                  className="w-full py-3 bg-primary text-on-primary font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all glow-emerald"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions
                  </span>
                  ROUTE TO EMERGENCY ER
                </a>
              </div>
            </div>

          </div>

          {/* Hospital List bottom section */}
          <div className="h-44 overflow-y-auto p-4 space-y-2 bg-surface-container-low border-t border-white/10 scrollbar-hide">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Nearby Facilities</h4>
            
            {hospitalsList.map((h) => {
              const isSelected = selectedHospital.name === h.name;
              return (
                <div 
                  key={h.name}
                  onClick={() => setSelectedHospital(h)}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-white/5 border-white/10' 
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center border border-white/5 flex-shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant text-base">
                      {h.name.includes('Hospital') ? 'local_hospital' : 'medical_services'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{h.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{h.distance} • {h.duration}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-sm">chevron_right</span>
                </div>
              );
            })}
          </div>

        </div>

      </section>

    </div>
  );
}
