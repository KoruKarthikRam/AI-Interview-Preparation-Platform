'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { authService, getToken } from '../../services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (getToken()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-royal-bg text-gold-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Gradients - Premium ambient radial glows */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-royal-purple/10 rounded-full blur-[110px] -z-10 animate-pulse" style={{ animationDuration: '9s' }} />
      <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-gold-950/10 rounded-full blur-[110px] -z-10 animate-pulse" style={{ animationDuration: '13s' }} />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 relative">
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-8 group">
          <div className="p-2.5 bg-gold-gradient rounded-xl shadow-lg shadow-gold-500/10 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5.5 w-5.5 text-black" />
          </div>
          <div>
            <span className="font-serif font-extrabold text-2xl tracking-widest text-gold-gradient uppercase block">
              PrepRoyal
            </span>
            <span className="text-[8px] text-gold-500/50 tracking-widest uppercase font-bold leading-none mt-0.5">Sovereign Standard</span>
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-wide font-serif text-gold-gradient">
          Create a New Account
        </h2>
        <p className="mt-3 text-xs uppercase tracking-wider text-gold-200/50">
          Or{' '}
          <Link href="/login" className="font-bold text-gold-400 hover:text-gold-200 transition-colors">
            log in to your existing account
          </Link>
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10 relative">
        <div className="bg-royal-card/60 backdrop-blur-2xl py-10 px-6 border border-gold-500/10 shadow-2xl shadow-gold-500/5 rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex items-start gap-3 text-rose-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gold-200/70">
                Full Name
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-500/50">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full pl-11 pr-4 py-3 bg-royal-bg/60 border border-gold-500/10 rounded-2xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500/50 text-gold-100 placeholder-gold-500/20 text-sm transition-all focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gold-200/70">
                Email Address
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-500/50">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-royal-bg/60 border border-gold-500/10 rounded-2xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500/50 text-gold-100 placeholder-gold-500/20 text-sm transition-all focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gold-200/70">
                Password
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-500/50">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full pl-11 pr-4 py-3 bg-royal-bg/60 border border-gold-500/10 rounded-2xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500/50 text-gold-100 placeholder-gold-500/20 text-sm transition-all focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-gold-300/30 rounded-2xl shadow-lg shadow-gold-500/10 text-xs font-bold uppercase tracking-widest text-black bg-gold-gradient hover:opacity-90 disabled:opacity-50 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
