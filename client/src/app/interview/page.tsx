'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Video, 
  PlusCircle, 
  Calendar, 
  Award, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { interviewService, resumeService } from '../../services/api';

export default function InterviewListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [hasResume, setHasResume] = useState(false);
  
  // Form fields
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await interviewService.list();
        setInterviews(list);
        
        const latestResume = await resumeService.getLatest().catch(() => null);
        setHasResume(!!latestResume);
      } catch (err: any) {
        console.error('Failed to load interviews', err);
        setError('Failed to retrieve past interview sessions.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !difficulty) return;

    setError('');
    setCreating(true);
    try {
      const interview = await interviewService.create(role, difficulty);
      router.push(`/interview/${interview.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize mock interview session.');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            <p className="text-gold-400 text-sm font-semibold tracking-wide animate-pulse">Loading mock interview history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide font-serif text-gold-gradient">
            Mock Interviews
          </h1>
          <p className="text-gold-200/50 text-xs mt-1 font-medium tracking-wide">Configure and start simulated interview loops graded instantly by AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings / Generator Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md shadow-sm">
              <h3 className="font-serif font-bold text-gold-200 text-sm mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-400" />
                Interview Configuration
              </h3>

              <form onSubmit={handleStartInterview} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold-200/70 mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Java Developer, React Engineer"
                    className="block w-full px-4 py-3 bg-royal-bg border border-gold-500/10 rounded-2xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500/50 text-gold-100 text-sm focus:outline-hidden placeholder-gold-500/20 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold-200/70 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          difficulty === diff
                            ? 'bg-gold-500/10 border-gold-500 text-gold-300'
                            : 'bg-royal-bg/60 border-gold-500/10 text-gold-400 hover:text-gold-200 hover:bg-gold-950/15'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 font-medium bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-black bg-gold-gradient border border-gold-300/30 shadow-lg shadow-gold-500/10 hover:opacity-90 disabled:opacity-50 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  {creating ? 'Generating 10 questions...' : 'Start Mock Interview'}
                  {!creating && <ArrowRight className="h-4 w-4 text-black" />}
                </button>
              </form>
            </div>

            {/* Resume upload check tip */}
            {!hasResume && (
              <div className="p-5 rounded-3xl border border-gold-500/20 bg-gold-950/10 text-xs text-gold-200/60 leading-relaxed flex gap-3 shadow-xs">
                <Info className="h-5 w-5 text-gold-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-gold-300 uppercase tracking-wider text-[10px]">General Questions Mode</h4>
                  <p className="mt-1 font-light leading-relaxed">
                    You haven't uploaded a resume yet. The questions generated will be general interview topics. For tailored, project-specific questions, upload your resume in the{' '}
                    <span onClick={() => router.push('/resume')} className="text-gold-400 hover:underline cursor-pointer font-semibold">
                      Resume Analyzer
                    </span>{' '}
                    first.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* History Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif font-bold text-gold-200 text-sm mb-4">Past Sessions</h3>

            {interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-5 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-royal-bg border border-gold-500/10 rounded-xl text-gold-400">
                        <Video className="h-5 w-5 text-gold-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gold-100 text-sm">{interview.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gold-500 mt-1.5 font-medium">
                          <span>{interview.role}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                            interview.difficulty === 'Easy'
                              ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                              : interview.difficulty === 'Medium'
                              ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                              : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                          }`}>
                            {interview.difficulty}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gold-500/50" />
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-gold-500/10 sm:border-0 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest">Average Score</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {interview.score !== null && <Award className="h-4 w-4 text-gold-405" />}
                          <span className="text-sm font-bold text-gold-100 font-serif">
                            {interview.score !== null ? `${interview.score}/10` : 'Incomplete'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (interview.score !== null) {
                            router.push(`/interview/${interview.id}/feedback`);
                          } else {
                            router.push(`/interview/${interview.id}`);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          interview.score !== null
                            ? 'border-gold-500/15 hover:bg-gold-950/15 text-gold-300 hover:border-gold-500/35'
                            : 'bg-gold-500/10 border-gold-500/20 hover:bg-gold-500/20 text-gold-400'
                        }`}
                      >
                        {interview.score !== null ? 'View Report' : 'Resume Mock'}
                        <ChevronRight className="h-4 w-4 text-gold-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gold-500/10 rounded-3xl bg-royal-card/10">
                <Video className="h-8 w-8 text-gold-500/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-gold-300">No mock interviews completed</p>
                <p className="text-xs text-gold-500 mt-1 max-w-[280px] mx-auto leading-relaxed font-light">
                  Configure your target role on the left to initialize your first AI interview simulator.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
