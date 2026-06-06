'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/utils/services';
import { Profile } from '@/types';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DatabaseService.getCurrentUser().then(currUser => {
      if (!currUser) {
        router.push('/login');
        return;
      }
      setUser(currUser);
      setLoading(false);
    });
  }, []);

  // Mock data for Recharts matching exactly the Figma line chart layout:
  // Friday, Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday
  const chartData = [
    { day: 'Mon', intake: 1800, glucose: 110, target: 2000 },
    { day: 'Tue', intake: 1950, glucose: 115, target: 2000 },
    { day: 'Wed', intake: 1720, glucose: 105, target: 2000 },
    { day: 'Thu', intake: 2600, glucose: 168, target: 2000 }, // Thursday spike!
    { day: 'Fri', intake: 1900, glucose: 120, target: 2000 },
    { day: 'Sat', intake: 2100, glucose: 118, target: 2000 },
    { day: 'Sun', intake: 2050, glucose: 122, target: 2000 }
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">7-Day Health and Compliance Ledger</h1>
          <p className="text-sm text-on-surface-variant mt-1">Deep clinical audit of nutritional intake vs biometric response.</p>
        </div>
        <div className="flex gap-2">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(78,222,163,0.6)]"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Compliance: 84%</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container shadow-[0_0_8px_rgba(252,124,120,0.6)]"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Glucose Delta: +12%</span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Chart & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Comparison Area */}
        <div className="lg:col-span-9 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Comparative Performance: Calories & Glucose Stability</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-[2px] bg-primary rounded"></span>
                <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Actual Intake</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-[2px] border-t border-dashed border-outline rounded"></span>
                <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Clinical Target</span>
              </div>
            </div>
          </div>

          {/* Recharts Line Chart with glowing accents */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#86948a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val}
                  tick={({ x, y, payload }) => {
                    const isThu = payload.value === 'Thu';
                    return (
                      <text x={x} y={y + 16} fill={isThu ? '#4edea3' : '#86948a'} fontWeight={isThu ? 'bold' : 'normal'} textAnchor="middle" className="text-xs">
                        {payload.value}
                      </text>
                    );
                  }}
                />
                <YAxis stroke="#86948a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(14, 21, 17, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#dde4dd'
                  }}
                />
                {/* Dashed Target line */}
                <ReferenceLine y={2000} stroke="#86948a" strokeDasharray="4 4" opacity={0.5} />
                {/* Calories Line */}
                <Line 
                  type="monotone" 
                  dataKey="intake" 
                  stroke="#4edea3" 
                  strokeWidth={3} 
                  dot={{ fill: '#4edea3', strokeWidth: 1, r: 4 }} 
                  activeDot={{ r: 6, fill: '#6ffbbe' }}
                />
                {/* Glucose Peak line (only shows high warning on Thursday) */}
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#fc7c78" 
                  strokeWidth={2}
                  dot={({ cx, cy, payload }) => {
                    if (payload.day === 'Thu') {
                      return (
                        <circle cx={cx} cy={cy} r={6} fill="#fc7c78" className="animate-pulse" />
                      );
                    }
                    return <circle cx={cx} cy={cy} r={3} fill="#fc7c78" opacity={0.6} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Float Alert Label for Thursday */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 glass-card border-tertiary-container/30 px-3 py-1.5 rounded-lg vitals-glow-amber">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-container text-sm">warning</span>
                <span className="text-[10px] font-bold text-white font-mono uppercase">Thursday: High sugar spike detected from local snack</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Avg. Daily Calories</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">2,140</span>
              <span className="text-xs text-on-surface-variant">kcal</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[92%]"></div>
            </div>
            <p className="text-[10px] text-primary/80 font-bold">92% of weekly target achieved</p>
          </div>

          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Glucose Stability</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-tertiary-container">SD 14.2</span>
              <span className="text-xs text-on-surface-variant">mg/dL</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-tertiary-container h-full w-[65%]"></div>
            </div>
            <p className="text-[10px] text-tertiary-container/80 font-bold">Variability above safe clinical range</p>
          </div>
        </div>

      </div>

      {/* Bottom Insights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Success Metrics Card */}
        <div className="glass-card rounded-2xl p-6 border-primary/20 vitals-glow-emerald">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/25">
              <span className="material-symbols-outlined text-primary font-bold">verified</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Success Metrics</h4>
              <p className="text-xs text-on-surface-variant">High-compliance nutritional milestones</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-lg object-cover" 
                  alt="Mediterranean grain bowl healthy meal" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS68M54GUtI3PexGFm42HMEQu_BrbtKsXzvareFVlcbOlA0DChyD8bGTzfe4SrBNWKeDGfyenHhX0Gc28Bi_qWsorZK-C8HaMk9dMnpe9c00ZEHpfj1iGZVKJTpTMCNNBqMvAiJ8aq4nMP1syoSk0dRsiT29Ts7g9qrJIhddnsPCQ9b7AUoyDy3A6F5ihn27Mu1K7ATVHUQK20-h1W7MV1JWRRK9CRX0OYG6cUBWR5-fZ5_KO_9uG6IbFQvIsUkMxfvbu5MWx__a2-"
                />
                <div>
                  <p className="text-sm font-bold text-white">Quinoa & Roasted Veg</p>
                  <p className="text-[10px] text-primary font-bold">Zero glycemic spike recorded</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <img 
                  className="w-10 h-10 rounded-lg object-cover" 
                  alt="Vibrant green spinach kale smoothie shake" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_Yvmhu8wExJQP7nxJPx6x5N8LmZYvfIQp0cpXuZ7rAe8ElNyMA9L5HU9ys5X_gLNaBU4UGUvPuHfmtQOJ2b1DBnNBVN0BiyugViR0bBFNAhBNh0Lo2QG2nw4tPdpHeIvXik-xkLPTtKtk6YdR2Y5OKvTiORwntygU1aWjuyJBbbPjORhuIDKgzRG7OfeYHa6YuABaRJWuFZ6lEcSqZb5qF38r3ySWLzQhMcCGWeWaxPW1l6BunQJwiWP6AbwvyhLBv7y2l9PCr1mG"
                />
                <div>
                  <p className="text-sm font-bold text-white">Morning Vitality Shake</p>
                  <p className="text-[10px] text-primary font-bold">Consistent fiber-target match</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>
        </div>

        {/* Learning Curve Log Card */}
        <div className="glass-card rounded-2xl p-6 border-tertiary-container/20 vitals-glow-amber">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center border border-tertiary-container/20">
              <span className="material-symbols-outlined text-tertiary-container font-bold">psychology</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Learning Curve Log</h4>
              <p className="text-xs text-on-surface-variant">Environmental & biological triggers</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 border-l-4 border-l-tertiary-container">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-white">The \"Thursday Slump\"</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    High-stress meeting @ 3:00 PM triggered craving for processed snacks.
                  </p>
                </div>
                <span className="bg-tertiary-container/15 text-tertiary-container text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">TRIGGER</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 border-l-4 border-l-tertiary-container">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-white">Late Night Insomnia</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Elevated cortisol levels correlate with midnight sodium intake.
                  </p>
                </div>
                <span className="bg-tertiary-container/15 text-tertiary-container text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">CORRELATION</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
