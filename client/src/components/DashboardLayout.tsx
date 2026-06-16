'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  BarChart3, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  Code,
  Terminal,
  Map
} from 'lucide-react';
import { authService, clearToken, getToken } from '../services/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const user = await authService.me();
        setCurrentUser(user);
        setLoading(false);
      } catch (err) {
        console.error('Session expired', err);
        clearToken();
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', href: '/resume', icon: FileText },
    { name: 'Mock Interviews', href: '/interview', icon: Video },
    { name: 'LeetCode Mode', href: '/leetcode', icon: Terminal },
    { name: 'Live Coding', href: '/coding', icon: Code },
    { name: 'AI Roadmap', href: '/roadmap', icon: Map },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-royal-bg text-gold-100 font-sans selection:bg-gold-500/30 selection:text-gold-200">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-royal-purple/10 via-royal-bg to-royal-bg pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-950/5 via-transparent to-transparent pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-gold-500/10 bg-royal-card/80 backdrop-blur-2xl sticky top-0 h-screen p-6">
        {/* Logo */}
        <div className="flex items-center gap-3.5 mb-10">
          <div className="p-2 bg-gold-gradient rounded-xl shadow-lg shadow-gold-500/10">
            <Sparkles className="h-5.5 w-5.5 text-black" />
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-xl tracking-wider text-gold-gradient uppercase">
              PrepRoyal
            </h1>
            <span className="text-[9px] text-gold-500/70 tracking-widest uppercase font-bold">Sovereign Interview Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gold-gradient text-black font-semibold shadow-lg shadow-gold-500/10 border-l-2 border-gold-300'
                    : 'text-gold-200/60 hover:text-gold-200 hover:bg-gold-500/5 hover:border-gold-500/10 border border-transparent'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-black' : 'text-gold-500/60 group-hover:text-gold-400 transition-colors'}`} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-gold-500/10 pt-6 mt-auto">
          <div className="flex items-center gap-3 mb-5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-950 border border-gold-500/30 text-gold-400 font-semibold text-sm shadow-inner shadow-gold-500/5">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-gold-100">{currentUser?.name}</p>
              <p className="text-[10px] text-gold-500/70 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-gold-200/50 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/30 border border-transparent transition-all duration-300 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-gold-500/10 bg-royal-card/85 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gold-gradient rounded-lg">
              <Sparkles className="h-4.5 w-4.5 text-black" />
            </div>
            <h1 className="font-serif font-extrabold text-base text-gold-gradient uppercase tracking-wide">PrepRoyal</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-gold-500/10 text-gold-400 hover:text-gold-200 bg-gold-950/20"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 bg-royal-bg/95 backdrop-blur-2xl z-45 flex flex-col p-6 animate-fade-in border-b border-gold-500/10">
            <nav className="space-y-2 flex-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gold-gradient text-black font-semibold'
                        : 'text-gold-200/60 hover:text-gold-200 hover:bg-gold-500/5'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gold-500/10 pt-6">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-950 border border-gold-500/30 text-gold-400 font-semibold text-sm">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gold-200">{currentUser?.name}</p>
                  <p className="text-xs text-gold-500">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gold-200/50 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
