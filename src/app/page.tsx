'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseService } from '@/utils/services';
import { Profile, FoodLog, LeaderboardEntry } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [diseases, setDiseases] = useState<string[]>([]);
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currUser = await DatabaseService.getCurrentUser();
        if (!currUser) {
          router.push('/login');
          return;
        }

        // If not onboarded (missing vital measurements), redirect to onboarding
        if (!currUser.height || !currUser.weight) {
          router.push('/onboarding');
          return;
        }

        setUser(currUser);

        // Load medical details
        const uDiseases = await DatabaseService.getUserDiseases(currUser.id);
        setDiseases(uDiseases);

        // Load logs
        const logs = await DatabaseService.getFoodLogs(currUser.id);
        setRecentLogs(logs.slice(0, 3)); // show top 3

        // Load leaderboard
        const board = await DatabaseService.getLeaderboard();
        setLeaderboard(board.slice(0, 3)); // show top 3

      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-on-surface-variant font-medium">Synchronizing medical data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate BMI warning levels
  const getBmiDetails = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: 'text-blue-400', glow: 'border-blue-500/30' };
    if (bmiVal < 25) return { label: 'Optimal', color: 'text-primary', glow: 'border-primary/30 emerald-glow' };
    if (bmiVal < 30) return { label: 'Overweight', color: 'text-tertiary', glow: 'border-tertiary/30 ruby-glow' };
    return { label: 'Obese', color: 'text-error', glow: 'border-error/30 ruby-glow' };
  };

  const bmiDetails = getBmiDetails(user.bmi || 24.5);
  const myLeaderboardRank = leaderboard.find(l => l.user_id === user.id || l.name === 'You');

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-primary">{user.full_name || 'Guest'}</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Clinical Health Ledger & physiological tracker.
          </p>
        </div>
        
        {/* Quick Date Display */}
        <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border-white/5">
          <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
          <span className="text-xs font-mono font-medium text-on-surface-variant">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Disease Alert Banners */}
      {diseases.length > 0 && (
        <section className="bg-error-container/10 border border-error/20 rounded-xl p-4 flex items-start gap-4 ruby-glow">
          <span className="material-symbols-outlined text-error font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <div>
            <p className="text-error font-bold text-sm">🔴 ACTIVE METABOLIC PROFILES: {diseases.join(', ')}</p>
            <p className="text-on-error-container text-xs mt-1">
              Food analyses are dynamically cross-referenced against your diagnosed conditions to alert you of glycemic and sodium thresholds.
            </p>
          </div>
        </section>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column A: Vitals Metrics & Food Logs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Vitals Overview */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-xl border-white/5 flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider">Weight</span>
                <span className="material-symbols-outlined text-sm">monitor_weight</span>
              </div>
              <div>
                <p className="text-3xl font-mono font-semibold text-white">{user.weight} <span className="text-xs font-sans font-normal opacity-60">kg</span></p>
                <p className="text-[10px] text-on-surface-variant mt-1">Target: 78 kg</p>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border-white/5 flex flex-col justify-between min-h-[120px]">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider">Height</span>
                <span className="material-symbols-outlined text-sm">straighten</span>
              </div>
              <div>
                <p className="text-3xl font-mono font-semibold text-white">{user.height} <span className="text-xs font-sans font-normal opacity-60">cm</span></p>
                <p className="text-[10px] text-on-surface-variant mt-1">Stature value</p>
              </div>
            </div>

            <div className={`glass-card p-4 rounded-xl border ${bmiDetails.glow} flex flex-col justify-between min-h-[120px] col-span-2 md:col-span-1`}>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-[10px] font-bold uppercase tracking-wider">BMI Index</span>
                <span className="material-symbols-outlined text-sm">speed</span>
              </div>
              <div>
                <p className="text-3xl font-mono font-semibold text-white">{user.bmi}</p>
                <p className={`text-[10px] font-bold ${bmiDetails.color} mt-1`}>{bmiDetails.label} range</p>
              </div>
            </div>
          </section>

          {/* Recent Food Analysis Logs */}
          <section className="glass-card rounded-xl p-6 border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Nutrition Logs</h3>
                <p className="text-xs text-on-surface-variant">Caloric and macro history of your meals.</p>
              </div>
              <Link href="/scanner" className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add</span>
                Scan Food
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-sm">
                No meals logged yet. Upload your first meal photo to get metabolic diagnostics!
              </div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-surface-container-low rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{log.food_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          log.risk_level === 'SAFE' ? 'bg-primary/20 text-primary' :
                          log.risk_level === 'CAUTION' ? 'bg-tertiary/20 text-tertiary' :
                          'bg-error/20 text-error'
                        }`}>
                          {log.risk_level}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-1 italic">
                        &ldquo;{log.recommendation}&rdquo;
                      </p>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant">Calories</p>
                        <p className="text-sm font-mono font-semibold text-primary">{log.calories} kcal</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant">Carbs</p>
                        <p className="text-sm font-mono font-semibold text-white">{log.carbs}g</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant">Protein</p>
                        <p className="text-sm font-mono font-semibold text-white">{log.protein}g</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Column B: Consistency & Gamification */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Consistency Streak Leaderboard snippet */}
          <section className="glass-card rounded-xl overflow-hidden border-white/5">
            <div className="p-6 bg-gradient-to-br from-primary/15 to-transparent border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Gamified Consistency</h3>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <p className="text-xl font-bold text-primary">
                    {myLeaderboardRank ? `${myLeaderboardRank.streak}-Day Streak!` : '0-Day Streak!'}
                  </p>
                  <p className="text-xs text-on-primary-container">
                    Keep logging daily to lock in your metrics
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Addis Ababa Leaderboard</p>
              
              <table className="w-full text-left">
                <tbody className="text-xs">
                  {leaderboard.map((entry) => {
                    const isMe = entry.user_id === user.id || entry.name === 'You';
                    return (
                      <tr key={entry.id} className={`border-b border-white/5 last:border-0 ${isMe ? 'bg-primary/10 font-semibold' : ''}`}>
                        <td className="py-3 px-2 text-on-surface-variant">{entry.rank}</td>
                        <td className="py-3 px-2 text-white flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden flex items-center justify-center text-[8px]">
                            {isMe ? 'ME' : entry.name.substring(0,2)}
                          </div>
                          {entry.name}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-primary">{entry.points} pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <Link href="/scanner" className="w-full block text-center mt-2 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5 transition-colors rounded-lg">
                View Full Leaderboard
              </Link>
            </div>
          </section>

          {/* Daily Tip Widget */}
          <section className="p-4 rounded-xl bg-surface-container-highest border border-white/5 flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">Daily Health Tip</p>
              <p className="text-xs text-on-surface-variant italic">
                &ldquo;A 10-minute light walk immediately following a heavy Injera meal can decrease glucose spikes by up to 15%.&rdquo;
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
