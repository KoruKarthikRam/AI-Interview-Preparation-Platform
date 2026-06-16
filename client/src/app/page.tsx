'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  FileText, 
  Mic, 
  BarChart3, 
  ArrowRight,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-royal-bg text-gold-100 font-sans overflow-hidden selection:bg-gold-500/30 selection:text-gold-200 relative">
      {/* Background decoration - Premium ambient radial glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-royal-purple/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 left-0 w-[650px] h-[650px] bg-gold-950/10 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-gold-900/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-gradient rounded-xl shadow-lg shadow-gold-500/10">
            <Sparkles className="h-5.5 w-5.5 text-black" />
          </div>
          <div>
            <span className="font-serif font-extrabold text-2xl tracking-widest text-gold-gradient uppercase">
              PrepRoyal
            </span>
            <span className="block text-[8px] text-gold-500/50 tracking-widest uppercase font-bold text-center leading-none mt-0.5">Sovereign Standard</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-xs font-bold uppercase tracking-wider text-gold-400/70 hover:text-gold-200 transition-colors cursor-pointer"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-gold-gradient text-black hover:opacity-90 rounded-xl transition-all shadow-md shadow-gold-500/10 hover:shadow-gold-500/25 cursor-pointer"
          >
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/20 bg-gold-950/20 text-gold-300 text-xs font-bold tracking-wide mb-10 animate-fade-in">
          <BrainCircuit className="h-4 w-4 text-gold-400" />
          <span className="uppercase tracking-widest text-[10px]">Elite Mock Interviews Powered by Gemini</span>
        </div>
        
        <h1 className="text-5xl md:text-7.5xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1] font-serif text-gold-gradient">
          Master Your Next Technical Interview
        </h1>
        
        <p className="text-gold-200/70 text-base md:text-lg max-w-2.5xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
          Sovereign-class mock interview simulations, premium resume intelligence, and real-time speech analytics. Bridge the gap between engineering excellence and your dream offer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
          <Link
            href="/register"
            className="flex items-center gap-2 px-8 py-4.5 bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-gold-500/10 hover:shadow-gold-500/30 hover:scale-[1.02] cursor-pointer group"
          >
            Start Preparing Now
            <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-8 py-4.5 bg-gold-950/10 border border-gold-500/20 hover:bg-gold-950/30 text-gold-300 hover:text-gold-100 font-bold uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer hover:border-gold-500/40"
          >
            Log In
            <ChevronRight className="h-3.5 w-3.5 text-gold-400" />
          </Link>
        </div>

        {/* Dashboard Mock Preview */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-gold-500/10 bg-royal-card/40 backdrop-blur-2xl p-4 shadow-2xl shadow-gold-500/5">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-royal-purple/5 rounded-full blur-[80px] -z-10" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gold-500/5 rounded-full blur-[80px] -z-10" />
          
          <div className="rounded-2xl border border-gold-500/5 overflow-hidden shadow-inner aspect-video flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-royal-card via-royal-bg to-royal-bg">
            <div className="p-4 bg-gold-500/10 rounded-2xl border border-gold-500/20 mb-4 animate-pulse">
              <Sparkles className="h-8 w-8 text-gold-400" />
            </div>
            <h3 className="text-2xl font-serif text-gold-200 mb-3 tracking-wide">Interactive AI Mock Experience</h3>
            <p className="text-gold-200/50 text-sm max-w-md font-light leading-relaxed">
              Real-time response tracking, visual audio feedback soundwaves, and structured report cards evaluated question-by-question.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-28 border-t border-gold-500/10 relative z-10">
        <h2 className="text-3xl md:text-4.5xl font-extrabold text-center mb-20 tracking-wider font-serif text-gold-gradient uppercase">
          Sovereign Tier Engineering
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl border border-gold-500/10 bg-royal-card/30 backdrop-blur-md hover:border-gold-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/5 group">
            <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-2xl w-fit mb-8 text-gold-400 group-hover:bg-gold-gradient group-hover:text-black transition-all">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gold-200 mb-4 group-hover:text-gold-400 transition-colors">Resume Analysis</h3>
            <p className="text-gold-200/50 text-sm leading-relaxed font-light">
              Upload your PDF resume to extract skills, spot key missing keywords required for target roles, and list strengths and weaknesses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl border border-gold-500/10 bg-royal-card/30 backdrop-blur-md hover:border-gold-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/5 group">
            <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-2xl w-fit mb-8 text-gold-400 group-hover:bg-gold-gradient group-hover:text-black transition-all">
              <Mic className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gold-200 mb-4 group-hover:text-gold-400 transition-colors">Voice Mock Interviews</h3>
            <p className="text-gold-200/50 text-sm leading-relaxed font-light">
              Take mock interviews with customized timers. Practice speaking naturally using browser speech recognition that writes out your response.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl border border-gold-500/10 bg-royal-card/30 backdrop-blur-md hover:border-gold-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/5 group">
            <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-2xl w-fit mb-8 text-gold-400 group-hover:bg-gold-gradient group-hover:text-black transition-all">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gold-200 mb-4 group-hover:text-gold-400 transition-colors">Analytics Dashboard</h3>
            <p className="text-gold-200/50 text-sm leading-relaxed font-light">
              Track mock scores week-over-week, visualize topic performance, and review detailed lists of question improvements.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-gold-500/10 flex flex-col sm:flex-row items-center justify-between text-gold-500/50 text-xs tracking-wider uppercase font-semibold">
        <p>© 2026 PrepRoyal. All rights reserved.</p>
        <div className="flex gap-8 mt-4 sm:mt-0">
          <Link href="/login" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
          <Link href="/login" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}

