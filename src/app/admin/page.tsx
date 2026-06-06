'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/utils/services';
import { Profile } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 1284, activeUsers: 942, avgBmiImprovement: -2.4, emergencyCases: 3 });
  const [patients, setPatients] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisease, setFilterDisease] = useState('All');

  useEffect(() => {
    async function loadAdminData() {
      const currUser = await DatabaseService.getCurrentUser();
      if (!currUser || currUser.role !== 'admin') {
        // Redirect non-admins to login
        router.push('/login');
        return;
      }
      setAdminUser(currUser);

      // Load static data
      const ov = await DatabaseService.getAdminOverview();
      setStats(ov);

      const patientData = await DatabaseService.getPatientMatrix();
      setPatients(patientData);

      const incidentData = await DatabaseService.getIncidentFeed();
      setIncidents(incidentData);

      setLoading(false);
    }
    loadAdminData();
  }, []);

  // Simulate Realtime Incidents Feed in Mock Mode
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      const mockNewIncidents = [
        {
          id: `new-i-${Date.now()}`,
          name: 'Sarah Connor',
          type: 'SCAN VERIFIED',
          time: 'Just now',
          text: 'Meal compliant with Ketogenic protocol. Target glucose maintained.',
          severity: 'safe'
        },
        {
          id: `new-i-${Date.now() + 1}`,
          name: 'Arthur Kim',
          type: 'HIGH EMERGENCY',
          time: 'Just now',
          text: 'BP check logged manually: 170/110. Arrhythmic warning.',
          severity: 'high'
        },
        {
          id: `new-i-${Date.now() + 2}`,
          name: 'Samrawit T.',
          type: 'DEV ADVISORY',
          time: 'Just now',
          text: 'Streak milestone achieved: 10 days registered.',
          severity: 'warning'
        }
      ];

      // Randomly pick one new incident and add it
      const randomIncident = mockNewIncidents[Math.floor(Math.random() * mockNewIncidents.length)];
      setIncidents(prev => [randomIncident, ...prev].slice(0, 6)); // cap at 6 logs

      // Update emergency case counts if it was high severity
      if (randomIncident.severity === 'high') {
        setStats(prev => ({ ...prev, emergencyCases: prev.emergencyCases + 1 }));
      }
    }, 25000); // add a new mock live incident every 25 seconds

    return () => clearInterval(interval);
  }, [loading]);

  const handleExportCSV = () => {
    const headers = ['Name', 'Disease Profile', 'BMI', 'Compliance', 'Last Food Scan'];
    const rows = patients.map(p => [
      p.name,
      p.diseases,
      p.bmi,
      p.compliance,
      p.lastScan
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tenachin_Patient_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.diseases.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisease = filterDisease === 'All' || p.diseases.toLowerCase().includes(filterDisease.toLowerCase());
    return matchesSearch && matchesDisease;
  });

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative min-h-[85vh] -mx-4 -my-6">
      
      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <header className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Clinical Operations Dashboard</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Real-time aggregate patient metrics & system diagnostics.</p>
        </header>

        {/* Hero Stats Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Patients</span>
              <span className="material-symbols-outlined text-primary/60">groups</span>
            </div>
            <div>
              <div className="text-4xl font-mono font-semibold text-primary">{stats.totalUsers}</div>
              <div className="flex items-center gap-1 text-[10px] text-primary/80 mt-1 font-semibold">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                <span>+4.2% from last month</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider">Avg BMI Improvement</span>
              <span className="material-symbols-outlined text-primary/60">monitoring</span>
            </div>
            <div>
              <div className="text-4xl font-mono font-semibold text-white">
                {stats.avgBmiImprovement} <span className="text-base font-sans font-normal opacity-60">pts</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-1 font-semibold">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Within clinical target zone</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl flex flex-col justify-between min-h-[140px] border-error/20">
            <div className="flex justify-between items-start text-tertiary">
              <span className="text-[10px] font-bold uppercase tracking-wider">Open Emergency Alerts</span>
              <span className="material-symbols-outlined text-error">emergency</span>
            </div>
            <div>
              <div className="text-4xl font-mono font-semibold text-error">{String(stats.emergencyCases).padStart(2, '0')}</div>
              <div className="flex items-center gap-1 text-[10px] text-error mt-1 font-bold">
                <span className="material-symbols-outlined text-xs animate-pulse">priority_high</span>
                <span>Requires Immediate Triage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Matrix Table */}
        <section className="glass-card rounded-xl overflow-hidden border-white/5">
          <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">clinical_notes</span>
              Patient Health Matrix
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {/* Search input */}
              <input 
                type="text"
                placeholder="Search patient/diagnoses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-0"
              />

              {/* Filter select */}
              <select
                value={filterDisease}
                onChange={(e) => setFilterDisease(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary cursor-pointer"
              >
                <option value="All" className="bg-background">All Diagnoses</option>
                <option value="Diabetes" className="bg-background">Diabetes</option>
                <option value="Hypertension" className="bg-background">Hypertension</option>
                <option value="Kidney" className="bg-background">Kidney Disease</option>
              </select>

              <button 
                onClick={handleExportCSV}
                className="bg-black/20 px-4 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10 hover:bg-black/40 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50 text-on-surface-variant text-[9px] font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Disease Profile</th>
                  <th className="px-6 py-3 text-center">BMI</th>
                  <th className="px-6 py-3 text-center">Compliance</th>
                  <th className="px-6 py-3">Last Food Scan</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredPatients.map((p) => {
                  const isCritical = p.compliance === 'Critical';
                  const isAtRisk = p.compliance === 'At Risk';
                  
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-all duration-200">
                      <td className="px-6 py-4 flex items-center gap-3 font-semibold text-white">
                        <div className="w-7 h-7 rounded-full bg-secondary-container/30 border border-white/5 flex items-center justify-center text-[9px] font-bold text-primary">
                          {p.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant italic truncate max-w-[200px]">{p.diseases}</td>
                      <td className="px-6 py-4 text-center font-mono font-semibold text-white">{p.bmi}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div 
                            className={`w-2.5 h-2.5 rounded-full ${
                              isCritical ? 'bg-error animate-pulse shadow-[0_0_10px_rgba(255,180,171,0.8)]' :
                              isAtRisk ? 'bg-tertiary shadow-[0_0_8px_rgba(252,124,120,0.6)]' :
                              'bg-primary shadow-[0_0_8px_rgba(78,222,163,0.6)]'
                            }`}
                            title={p.compliance}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{p.lastScan}</td>
                      <td className="px-6 py-4 text-right">
                        {isCritical ? (
                          <button 
                            onClick={() => router.push(`/chatbot?emergency=true`)}
                            className="text-error hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            TRIAGE NOW
                          </button>
                        ) : (
                          <button className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                            VIEW FILE
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Network & Latency Vitals Sparklines (Atmospheric from design) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">System Latency / AI Processing</h3>
            <div className="h-16 w-full">
              <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path 
                  d="M0,45 Q20,30 40,40 T80,20 T120,45 T160,30 T200,50 T240,20 T280,40 T320,10 T360,35 T400,25" 
                  fill="none" 
                  stroke="#4edea3" 
                  strokeWidth="2"
                  className="vitals-line"
                />
                <circle cx="400" cy="25" fill="#4edea3" r="3" className="animate-ping" />
              </svg>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Network Throughput</h3>
            <div className="h-16 w-full">
              <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path 
                  d="M0,25 Q30,45 60,35 T120,50 T180,25 T240,40 T300,15 T360,30 T400,20" 
                  fill="none" 
                  stroke="#bcc7de" 
                  strokeWidth="2"
                  className="vitals-line"
                />
                <circle cx="400" cy="20" fill="#bcc7de" r="3" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </section>

      </main>

      {/* Right Sidebar: Incident Feed */}
      <aside className="w-full lg:w-85 bg-surface-container/30 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col h-[85vh]">
        <div className="pb-4 border-b border-white/10 flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-error font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            emergency_home
          </span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Incident Feed</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
          {incidents.map((incident) => {
            const isHigh = incident.severity === 'high';
            const isSafe = incident.severity === 'safe';
            
            return (
              <div 
                key={incident.id} 
                className={`glass-card p-4 rounded-xl border-l-4 transition-all duration-300 ${
                  isHigh ? 'border-l-error crimson-pulse' :
                  isSafe ? 'border-l-primary' :
                  'border-l-tertiary-container'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    isHigh ? 'bg-error/20 text-error' :
                    isSafe ? 'bg-primary/20 text-primary' :
                    'bg-tertiary-container/20 text-tertiary-container'
                  }`}>
                    {incident.type}
                  </span>
                  <span className="font-mono text-[9px] text-on-surface-variant font-semibold">{incident.time}</span>
                </div>
                
                <h4 className="text-xs font-bold text-white">{incident.name}</h4>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{incident.text}</p>
                
                {isHigh && (
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => router.push(`/chatbot?emergency=true`)}
                      className="flex-1 py-1.5 bg-error hover:brightness-115 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-md"
                    >
                      INTERVENE
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-white/10 border border-white/5 hover:bg-white/20 rounded-lg cursor-pointer">
                      <span className="material-symbols-outlined text-base">more_vert</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 text-center mt-4">
          <button className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline cursor-pointer">
            VIEW ALL INCIDENTS
          </button>
        </div>
      </aside>

    </div>
  );
}
