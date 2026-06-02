'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  FileText, 
  Video, 
  TrendingUp, 
  Award, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { analyticsService, interviewService, resumeService } from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    avgScore: 0,
    totalAnswers: 0,
    hasResume: false,
  });
  const [scoreTrend, setScoreTrend] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const analytics = await analyticsService.get();
        setStats(analytics.stats);
        setScoreTrend(analytics.scoreTrend);

        const list = await interviewService.list();
        setInterviews(list.slice(0, 5)); // show top 5 recent interviews
      } catch (err: any) {
        console.error('Failed to load dashboard data', err);
        setError('Failed to load dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-zinc-400 text-sm">Loading dashboard metrics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Dashboard
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Monitor your interview preparedness and target weak skills.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/resume"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 text-sm font-semibold transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Upload Resume
            </Link>
            <Link
              href="/interview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              New Mock Session
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md flex items-center gap-5">
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Interviews</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalInterviews}</h3>
              <p className="text-[10px] text-zinc-400 mt-1">{stats.completedInterviews} completed</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md flex items-center gap-5">
            <div className="p-3.5 bg-violet-500/10 rounded-2xl text-violet-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Average Score</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.avgScore > 0 ? `${stats.avgScore}/10` : 'N/A'}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-1">Across graded answers</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md flex items-center gap-5">
            <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Answers</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalAnswers}</h3>
              <p className="text-[10px] text-zinc-400 mt-1">Graded by Gemini</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-md flex items-center gap-5">
            <div className={`p-3.5 rounded-2xl ${stats.hasResume ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Resume Profile</p>
              <h3 className="text-lg font-bold text-white mt-1">
                {stats.hasResume ? 'Analyzed' : 'Missing'}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-1">
                {stats.hasResume ? 'Ready for interviews' : 'Upload for custom Qs'}
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Resume Prompt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-200">Score Trajectory</h2>
            </div>
            <div className="h-64 w-full">
              {isMounted && scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} domain={[0, 10]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                  Complete mock interviews to visualize your progress.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Tips */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-200 mb-4">Interviewer Insights</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 h-fit shrink-0">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-300">Target Weak Topics</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Check your category breakdown on the Analytics tab. Practicing technical answers generally boosts scores fastest.
                    </p>
                  </div>
                </div>
                {!stats.hasResume && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 h-fit shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-400">Missing Resume</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        Gemini generates custom interview questions targeting the projects on your resume. Upload one now for a tailormade experience.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Link
              href="/analytics"
              className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 hover:bg-zinc-900/50 hover:border-zinc-800 text-sm font-semibold transition-all group"
            >
              <span>View Skill Analytics</span>
              <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Interviews List */}
        <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-200">Recent Interview Sessions</h2>
            <Link href="/interview" className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              View all
            </Link>
          </div>

          {interviews.length > 0 ? (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800/80 transition-all gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-800">
                      <Video className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">{interview.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                        <span>{interview.role}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          interview.difficulty === 'Easy' 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                            : interview.difficulty === 'Medium'
                            ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                            : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                        }`}>
                          {interview.difficulty}
                        </span>
                        <span>•</span>
                        <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-zinc-900 sm:border-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Score</p>
                      <p className="text-sm font-bold text-zinc-200 mt-0.5">
                        {interview.score !== null ? `${interview.score}/10` : 'Incomplete'}
                      </p>
                    </div>

                    <Link
                      href={interview.score !== null ? `/interview/${interview.id}/feedback` : `/interview/${interview.id}`}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        interview.score !== null 
                          ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                          : 'bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400'
                      }`}
                    >
                      {interview.score !== null ? 'View Feedback' : 'Resume Interview'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
              <Video className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-400">No mock interviews yet</p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Start your first session to receive instant AI evaluations.</p>
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Create Mock Interview
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
