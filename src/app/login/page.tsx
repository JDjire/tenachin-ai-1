'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseService } from '@/utils/services';
import type { Profile } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterLogin = (profile: Profile) => {
    if (profile.role === 'admin') {
      router.push('/admin');
      return;
    }

    if (!profile.height || !profile.weight) {
      router.push('/onboarding');
      return;
    }

    router.push('/');
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 0));
    formRef.current?.requestSubmit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (role === 'admin') {
          throw new Error('Admin registration must be provisioned by the system administrator.');
        }
        await DatabaseService.signup(email, fullName, password, 'user');
        router.push('/onboarding');
      } else {
        const profile = await DatabaseService.login(email, password, role);
        redirectAfterLogin(profile);
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row overflow-hidden bg-background">
      {/* Left Side: Cinematic Graphic */}
      <section className="relative w-full md:w-1/2 h-64 md:h-screen overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        <img 
          className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" 
          alt="Bioluminescent green monitors in dark clinical lab" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4hwsOQgSMJNXxs9qDo6r81a5R0neAPdqxPMohkW43KaB8tEC7mgjznMb2jozT-J6HsVSewQUSlKBRf-5FAKeoW_jXQ2PiAtvQKBeIgBeyi3cUBNtLvUPkJh44pS9qrYqu21xQvwxSsB7mltQQNoaM4wYJi7npgEtCYB3Ik-P4iw5utDqeXCFiG0lkBSMlu_6kQ5N-DVx5kxJId1l1gA26ls7h-manPBTD9PqGQZJ4dR6jVM-9Xe_gw3O9gnWTwYTlJNij0-lIsF22"
        />
        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-20">
          <h1 className="font-sans font-bold text-3xl md:text-5xl text-white leading-tight drop-shadow-2xl">
            Tenachin AI:<br/><span className="text-primary">Your Health Guard</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-md mt-2 font-medium">
            Advanced clinical intelligence providing real-time physiological monitoring and precision diagnostics.
          </p>
        </div>
      </section>

      {/* Right Side: Glassmorphic Form */}
      <section className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-surface-dim relative min-h-[500px]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="w-full max-w-md z-10">
          {/* Header / Auth Toggle */}
          <div className="mb-8">
            <div className="flex p-1 bg-surface-container-low rounded-xl">
              <button 
                type="button"
                onClick={() => { setRole('user'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  role === 'user' 
                    ? 'bg-primary-container text-on-primary-container shadow-sm' 
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                PATIENT PORTAL
              </button>
              <button 
                type="button"
                onClick={() => { setRole('admin'); setIsSignUp(false); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  role === 'admin' 
                    ? 'bg-primary-container text-on-primary-container shadow-sm' 
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                CLINICAL ADMIN
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 glow-emerald">
            <h2 className="text-2xl font-bold text-white mb-1">
              {isSignUp ? 'Create Account' : `${role === 'admin' ? 'Clinical Admin' : 'Patient'} Login`}
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              {isSignUp 
                ? 'Enter your credentials to begin your wellness journey.' 
                : 'Enter your credentials to access your dashboard.'
              }
            </p>

            {error && (
              <div className="mb-4 p-3 bg-error-container/20 border border-error/40 text-error rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">FULL NAME</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Abebe Kebede"
                    className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">PASSWORD</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-black/30 border border-white/10 rounded-lg px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white text-sm transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Processing...' : (isSignUp ? 'REGISTER' : 'LOG IN')}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            {role === 'user' && (
              <div className="mt-6 text-center text-xs">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>
            )}

            {/* Quick Login Helpers for testing/demo convenience */}
            <div className="mt-6 border-t border-white/5 pt-4 text-center">
              <p className="text-[10px] uppercase text-on-surface-variant tracking-wider mb-2">Demo Quick Login</p>
              <div className="flex gap-2 justify-center">
                {role === 'user' ? (
                  <button 
                    onClick={() => { void handleDemoLogin('john@tenachin.ai'); }} 
                    type="button"
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-on-surface-variant hover:text-white cursor-pointer"
                    disabled={loading}
                  >
                    Load Jonathan (Diabetes Profile)
                  </button>
                ) : (
                  <button 
                    onClick={() => { void handleDemoLogin('admin@tenachin.ai'); }} 
                    type="button"
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-on-surface-variant hover:text-white cursor-pointer"
                    disabled={loading}
                  >
                    Load Chief Physician Credentials
                  </button>
                )}
              </div>
            </div>

          </div>
          
          {/* Footer links */}
          <div className="mt-8 flex justify-center gap-6">
            <a className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Protocol</a>
            <a className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors" href="#">Clinical Compliance</a>
            <a className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors" href="#">Support Center</a>
          </div>

        </div>
      </section>
    </main>
  );
}
