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
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950/90 to-black pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-950/15 via-transparent to-transparent pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-zinc-800/40 bg-zinc-950/60 backdrop-blur-xl sticky top-0 h-screen p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-white">
              PrepAI
            </h1>
            <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-semibold">AI Interview Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white font-medium shadow-md shadow-indigo-600/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-indigo-400 transition-colors'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-zinc-900 pt-6 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-semibold text-sm">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-zinc-200">{currentUser?.name}</p>
              <p className="text-[11px] text-zinc-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-zinc-800/40 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-extrabold text-base text-white">PrepAI</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 bg-zinc-950/95 backdrop-blur-2xl z-45 flex flex-col p-6 animate-fade-in">
            <nav className="space-y-2 flex-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-zinc-900 pt-6">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-semibold text-sm">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{currentUser?.name}</p>
                  <p className="text-xs text-zinc-500">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
