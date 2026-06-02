'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  FileText, 
  Mic, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[90px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-white">
            PrepAI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2.5 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl transition-all shadow-md shadow-white/5 cursor-pointer"
          >
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/40 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
          <BrainCircuit className="h-4 w-4 text-indigo-400" />
          <span>Next-Generation Mock Interviews Powered by Gemini</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
          Master Your Next Technical Interview
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered mock interviews, immediate resume feedback, and real-time speech evaluation. Bridge the gap between your resume and your dream job.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/register"
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer group"
          >
            Start Preparing Now
            <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-300 font-semibold rounded-2xl transition-all cursor-pointer"
          >
            Log In
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </Link>
        </div>

        {/* Dashboard Mock Preview */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-2xl p-3 md:p-4 shadow-2xl shadow-indigo-500/5">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -z-10" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-[80px] -z-10" />
          <div className="rounded-2xl border border-zinc-800/40 bg-zinc-950 overflow-hidden shadow-inner aspect-video flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
            <Sparkles className="h-12 w-12 text-indigo-400 animate-pulse mb-4" />
            <h3 className="text-xl font-bold text-zinc-200 mb-2">Interactive AI Mock Experience</h3>
            <p className="text-zinc-500 text-sm max-w-md">
              Real-time response tracking, visual audio feedback soundwaves, and structured report cards evaluated question-by-question.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-zinc-900/80 relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 tracking-tight">
          How PrepAI Sets You Apart
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md hover:border-zinc-800 transition-all group">
            <div className="p-3 bg-indigo-500/10 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 group-hover:text-white transition-colors">Resume Analysis</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Upload your PDF resume to extract skills, spot key missing keywords required for target roles, and list strengths and weaknesses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md hover:border-zinc-800 transition-all group">
            <div className="p-3 bg-violet-500/10 rounded-2xl w-fit mb-6 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
              <Mic className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 group-hover:text-white transition-colors">Voice Mock Interviews</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Take mock interviews with customized timers. Practice speaking naturally using browser speech recognition that writes out your response.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md hover:border-zinc-800 transition-all group">
            <div className="p-3 bg-blue-500/10 rounded-2xl w-fit mb-6 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-200 mb-3 group-hover:text-white transition-colors">Analytics Dashboard</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Track mock scores week-over-week, visualize topic performance, and review detailed lists of question improvements.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-sm">
        <p>© 2026 PrepAI. All rights reserved.</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <Link href="/login" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/login" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
