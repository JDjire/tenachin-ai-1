'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DatabaseService } from '@/utils/services';
import { Profile } from '@/types';
import LangSelector from '@/components/LangSelector';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get current user session
    DatabaseService.getCurrentUser().then(currUser => {
      setUser(currUser);
    });
  }, [pathname]);

  const handleLogout = async () => {
    await DatabaseService.logout();
    router.push('/login');
  };

  // Skip showing sidebar/header on login, signup, and onboarding pages
  const isAuthOrOnboarding = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/onboarding';

  if (isAuthOrOnboarding) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Food Scanner', path: '/scanner', icon: 'qr_code_scanner', fillIcon: true },
    { name: 'Analytics', path: '/analytics', icon: 'analytics', fillIcon: true },
    { name: 'Symptom Chat', path: '/chatbot', icon: 'chat_bubble' },
  ];

  // If user is admin, add Clinical Admin Link
  if (user?.role === 'admin') {
    navItems.push({ name: 'Clinical Center', path: '/admin', icon: 'admin_panel_settings' });
  }

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-sans font-bold text-2xl text-primary tracking-tight">
            Tenachin AI
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Search (Desktop Only) */}
          <div className="hidden md:flex bg-surface-container rounded-full px-4 py-2 items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
            <input 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface w-64" 
              placeholder="Search patients or vitals..." 
              type="text"
            />
          </div>
          <LangSelector />
          
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            notifications
          </span>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 cursor-pointer" onClick={() => router.push(user?.role === 'admin' ? '/admin' : '/onboarding')}>
            {user?.role === 'admin' ? (
              <img 
                alt="Admin profile avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmNavDajQDVcK46ZF_uyyJWfQfYfCJoyxvfwFhvRiXiek1lF4qzC4dt1SMCkp-FpLG6HdIxjWbeT8YDho-wPwwXW4YKK-QflVdcGizXYMK9TPch3W9eqk0ie05MxuSvWTwstuts0yoDz5puUuBmZIiLw5BdEKBnqdzLHGJ4bdEay7MyzGkcZisfZZXPX614dOGHQSgAMAzdFEmbfOLU9yNGWDV5tdQAMEBCdr4AIl_ETRNY01BtW0QIPgiJLLIBbhcDWSrXrxjEgvK"
              />
            ) : (
              <img 
                alt="User profile avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCinU95jsHHfoipYjXIaicFNslW_3h7XEhPYbvDTv0-C1DoKiYNQ25LrAUMljsHqopqp1MM5tRQo0cIU6gLWdqoF-3xP4fXj27kojRjDEitDp02Z0kmaiJZo5bvSUd-KQtiXySlATP_p2fODl1Y1xJOMzUVx7UnrkpZKOTYJhyiuyEU93UXA029PRVl3lkLZrcL7f65AAsZ5AOjWCbsH7lxBKwyCIk1Sz5nm7J7auL71d092hWdYl_eCc-M7SO4CM2-fN9Qwdcx5y6T"
              />
            )}
          </div>
        </div>
      </header>

      {/* Side Navigation (Desktop Only) */}
      <nav className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col bg-surface-container/60 backdrop-blur-2xl border-r border-white/10 shadow-xl py-4 gap-2 z-40 pt-20">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                qr_code_scanner
              </span>
            </div>
            <div>
              <h2 className="text-lg text-primary font-bold leading-tight">Tenachin AI</h2>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Clinical Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center gap-4 px-6 py-3 transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'bg-primary-container/20 text-primary border-r-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={{ fontVariationSettings: item.fillIcon && isActive ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-3 text-on-surface-variant hover:bg-white/5 hover:text-error transition-all duration-200 ease-in-out mt-auto cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => router.push('/chatbot?emergency=true')}
            className="w-full bg-error-container text-on-error-container py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-error transition-colors duration-200 ruby-glow cursor-pointer"
          >
            Emergency Triage
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="md:pl-64 pt-16 min-h-screen pb-20 md:pb-6">
        <main className="max-w-[1440px] mx-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 w-full md:hidden bg-background/90 backdrop-blur-lg border-t border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] flex justify-around items-center h-16 pb-safe z-50 rounded-t-xl">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center gap-0.5 tap-highlight-transparent ${pathname === '/' ? 'text-primary' : 'text-on-secondary-container'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/' ? "'FILL' 1" : undefined }}>home</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link 
          href="/scanner" 
          className={`flex flex-col items-center justify-center gap-0.5 tap-highlight-transparent ${pathname === '/scanner' ? 'text-primary' : 'text-on-secondary-container'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/scanner' ? "'FILL' 1" : undefined }}>camera</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Scanner</span>
        </Link>
        <Link 
          href="/chatbot" 
          className={`flex flex-col items-center justify-center gap-0.5 tap-highlight-transparent ${pathname === '/chatbot' ? 'text-primary' : 'text-on-secondary-container'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/chatbot' ? "'FILL' 1" : undefined }}>medical_services</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Triage</span>
        </Link>
        {user?.role === 'admin' && (
          <Link 
            href="/admin" 
            className={`flex flex-col items-center justify-center gap-0.5 tap-highlight-transparent ${pathname === '/admin' ? 'text-primary' : 'text-on-secondary-container'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/admin' ? "'FILL' 1" : undefined }}>security</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
