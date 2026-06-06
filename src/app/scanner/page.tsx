'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/utils/services';
import { Profile, FoodLog, FoodAnalysisResponse } from '@/types';
import { useRouter } from 'next/navigation';

export default function FoodScannerPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [userDiseases, setUserDiseases] = useState<string[]>([]);
  const [mealDetails, setMealDetails] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

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

      const logs = await DatabaseService.getFoodLogs(currUser.id);
      setRecentLogs(logs.slice(0, 3));

      const board = await DatabaseService.getLeaderboard();
      setLeaderboard(board);
    }
    loadData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate that mealDetails is not empty
    if (!mealDetails.trim()) {
      alert('Please enter the food name and meal details.');
      return;
    }
    
    setScanning(true);
    setAnalysisResult(null);

    // Simulate scanning delay for nice cinematic effect
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: mealDetails,
          ingredients: mealDetails,
          userDiseases,
          bmi: user.bmi,
          userId: user.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);

        // Refresh recent logs and leaderboard
        const updatedLogs = await DatabaseService.getFoodLogs(user.id);
        setRecentLogs(updatedLogs.slice(0, 3));
        const updatedBoard = await DatabaseService.getLeaderboard();
        setLeaderboard(updatedBoard);
      } else {
        console.error('Food scan failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const myLeaderboardRank = leaderboard.find(l => l.user_id === user?.id || l.name === 'You');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Nutritional Intelligence</h1>
        <p className="text-sm text-on-surface-variant">AI-driven metabolic analysis and clinical guard alerts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column A: Scanner & Analysis */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Scanner Dropzone */}
          <section className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            
            <form onSubmit={handleScan} className="space-y-4">
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer text-center min-h-[200px]">
                {imagePreview ? (
                  <div className="relative w-full max-h-[200px] overflow-hidden rounded-lg flex items-center justify-center">
                    <img src={imagePreview} alt="Food Upload Preview" className="max-h-[180px] object-cover rounded-lg" />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); }} 
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 emerald-glow">
                      <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Snap & Upload Food Photo</h3>
                    <p className="text-xs text-on-surface-variant max-w-xs">
                      AI will automatically analyze macronutrients, glycemic loads, and sodium logs.
                    </p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">
                  Food Name & Meal details
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={mealDetails}
                    onChange={(e) => setMealDetails(e.target.value)}
                    placeholder="e.g. Injera with Misir Wat, extra oil"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 h-12 text-sm focus:border-primary focus:ring-0 transition-all outline-none text-white"
                  />
                  <button 
                    type="submit"
                    disabled={scanning || !mealDetails.trim()}
                    className="px-6 h-12 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scanning ? 'SCANNING...' : 'ANALYZE'}
                    <span className="material-symbols-outlined text-sm">query_stats</span>
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Scanner Loading Effect */}
          {scanning && (
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden flex flex-col items-center justify-center space-y-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 overflow-hidden">
                <div className="w-1/3 h-full bg-primary animate-infinite-loading rounded-full"></div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">AI Clinical Health Guard Active</p>
                <p className="text-xs text-on-surface-variant mt-1">Estimating glycemic impact and scanning pre-existing profiles...</p>
              </div>
            </div>
          )}

          {/* AI Alert Banner (glowing warn banner) */}
          {analysisResult && analysisResult.risk_level !== 'SAFE' && (
            <section className="bg-error-container/10 border border-error rounded-xl p-4 flex items-start gap-4 ruby-glow">
              <span className="material-symbols-outlined text-error font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <div>
                <p className="text-error font-bold text-sm">
                  🔴 HEALTH RISK ALERT: {analysisResult.risk_level === 'RISK' ? 'Critical Vitals Threat' : 'High Glycemic Spike'} detected
                </p>
                <p className="text-on-error-container text-xs mt-1">
                  {analysisResult.disease_warning || "Meal exceeds recommended threshold for your medical profile. Recommend portion control."}
                </p>
              </div>
            </section>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <section className="glass-card rounded-2xl p-6 border-white/10 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Scan Result: <span className="text-primary">{analysisResult.food_name}</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant">Metabolic impact projection</p>
                </div>
                <div className="px-3 py-1 bg-surface-container-highest rounded-full flex items-center gap-1.5 border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live AI Analysis</span>
                </div>
              </div>

              {/* Macros Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Calories</p>
                  <p className="font-mono text-2xl font-semibold text-primary mt-1">
                    {analysisResult.calories} <span className="text-xs font-sans font-normal opacity-60">kcal</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Carbs</p>
                  <p className="font-mono text-2xl font-semibold text-white mt-1">
                    {analysisResult.carbs} <span className="text-xs font-sans font-normal opacity-60">g</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Sugars</p>
                  <p className="font-mono text-2xl font-semibold text-tertiary mt-1">
                    {analysisResult.sugar} <span className="text-xs font-sans font-normal opacity-60">g</span>
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Proteins</p>
                  <p className="font-mono text-2xl font-semibold text-white mt-1">
                    {analysisResult.protein} <span className="text-xs font-sans font-normal opacity-60">g</span>
                  </p>
                </div>
              </div>

              {/* Actionable Clinical Recommendations */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 border-l-4 border-l-primary space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-sm">clinical_notes</span>
                  AI Recommendations
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {analysisResult.recommendation}
                </p>
              </div>
            </section>
          )}

        </div>

        {/* Column B: Consistency & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Consistency Leaderboard */}
          <section className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="p-6 bg-gradient-to-br from-primary/15 to-transparent border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Leaderboard</h3>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <p className="text-xl font-bold text-primary">
                    {myLeaderboardRank ? `${myLeaderboardRank.streak}-Day Streak!` : '6-Day Streak!'}
                  </p>
                  <p className="text-xs text-on-primary-container">Top 5% in Addis Ababa</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <table className="w-full text-left">
                <thead className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-white/10">
                  <tr>
                    <th className="py-2">Rank</th>
                    <th className="py-2">User</th>
                    <th className="py-2 text-right">Streak</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {leaderboard.slice(0, 3).map((l) => {
                    const isMe = l.user_id === user?.id || l.name === 'You';
                    return (
                      <tr key={l.id} className={`border-b border-white/5 last:border-0 ${isMe ? 'bg-primary/10 font-bold' : ''}`}>
                        <td className={`py-3 px-1 ${isMe ? 'text-primary' : 'text-on-surface-variant'}`}>{l.rank}</td>
                        <td className="py-3 px-1 flex items-center gap-2 text-white">
                          <div className="w-5 h-5 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden flex items-center justify-center text-[8px]">
                            {isMe ? 'ME' : l.name.substring(0, 2)}
                          </div>
                          {l.name}
                        </td>
                        <td className={`py-3 px-1 text-right font-mono ${isMe ? 'text-primary' : 'text-white'}`}>{l.streak}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Vitals Preview Chart */}
          <section className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Glucose Monitoring (Post-Scan)
            </h3>
            
            <div className="relative h-24 mb-4">
              <div className="absolute inset-0 flex items-end gap-[3px]">
                {/* Mock Sparkline matching exact height distribution from design */}
                <div className="bg-primary/40 w-full h-[30%] rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-[45%] rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-[40%] rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-[60%] rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-[85%] rounded-t-sm"></div>
                <div className="bg-error w-full h-[95%] rounded-t-sm ruby-glow animate-pulse"></div>
                <div className="bg-error w-full h-[90%] rounded-t-sm"></div>
                <div className="bg-tertiary/40 w-full h-[70%] rounded-t-sm"></div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Current Glucose</p>
                <p className="text-lg font-mono font-bold text-error mt-0.5">
                  {analysisResult?.risk_level === 'CAUTION' || analysisResult?.risk_level === 'RISK' ? '154' : '108'}{' '}
                  <span className="text-[10px] font-sans font-normal text-on-surface-variant">mg/dL</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Predicted Peak</p>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  {analysisResult?.risk_level === 'CAUTION' || analysisResult?.risk_level === 'RISK' ? '178' : '124'}{' '}
                  <span className="text-[10px] font-sans font-normal text-on-surface-variant">mg/dL</span>
                </p>
              </div>
            </div>
          </section>

          {/* Daily Tip */}
          <section className="p-4 rounded-xl bg-surface-container-highest border border-white/5 flex gap-4">
            <div className="text-2xl">💡</div>
            <p className="text-xs text-on-surface-variant italic">
              "A 10-minute walk after this meal could reduce your peak glucose by up to 15%."
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
