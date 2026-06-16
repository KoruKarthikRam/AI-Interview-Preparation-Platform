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
import { analyticsService, interviewService } from '../../services/api';
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            <p className="text-gold-400 text-sm font-semibold tracking-wide animate-pulse">Loading dashboard metrics...</p>
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
            <h1 className="text-3xl font-extrabold tracking-wide font-serif text-gold-gradient">
              Dashboard
            </h1>
            <p className="text-gold-200/50 text-xs mt-1 font-medium tracking-wide">Monitor your interview preparedness and target weak skills.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/resume"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gold-500/10 bg-gold-950/10 hover:bg-gold-950/20 text-gold-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:border-gold-500/30"
            >
              <FileText className="h-4 w-4" />
              Upload Resume
            </Link>
            <Link
              href="/interview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-black text-xs font-bold uppercase tracking-widest border border-gold-300/30 shadow-md shadow-gold-500/10 hover:opacity-90 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-black" />
              New Mock Session
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 rounded-2xl text-gold-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">Interviews</p>
              <h3 className="text-2xl font-bold font-serif text-gold-100 mt-1">{stats.totalInterviews}</h3>
              <p className="text-[10px] text-gold-200/40 mt-1 font-medium">{stats.completedInterviews} completed</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 rounded-2xl text-gold-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">Average Score</p>
              <h3 className="text-2xl font-bold font-serif text-gold-100 mt-1">
                {stats.avgScore > 0 ? `${stats.avgScore}/10` : 'N/A'}
              </h3>
              <p className="text-[10px] text-gold-200/40 mt-1 font-medium">Across graded answers</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 rounded-2xl text-gold-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">Total Answers</p>
              <h3 className="text-2xl font-bold font-serif text-gold-100 mt-1">{stats.totalAnswers}</h3>
              <p className="text-[10px] text-gold-200/40 mt-1 font-medium">Graded by Gemini</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className={`p-3.5 border rounded-2xl ${stats.hasResume ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gold-500/10 border-gold-500/20 text-gold-400'}`}>
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">Resume Profile</p>
              <h3 className="text-lg font-bold font-serif text-gold-100 mt-1">
                {stats.hasResume ? 'Analyzed' : 'Missing'}
              </h3>
              <p className="text-[10px] text-gold-200/40 mt-1 font-medium">
                {stats.hasResume ? 'Ready for interviews' : 'Upload for custom Qs'}
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Resume Prompt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 p-6 rounded-3xl border border-gold-500/10 bg-royal-card/45 backdrop-blur-md flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-gold-400" />
              <h2 className="text-lg font-serif font-bold text-gold-200">Score Trajectory</h2>
            </div>
            <div className="h-64 w-full">
              {isMounted && scoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c5a059" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#251e16" vertical={false} />
                    <XAxis dataKey="name" stroke="#8c7554" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8c7554" fontSize={11} domain={[0, 10]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09070f', borderColor: 'rgba(197, 160, 89, 0.2)', borderRadius: '16px', color: '#f5ecd0' }}
                      labelStyle={{ color: '#c5a059', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#c5a059" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gold-500/50 text-xs uppercase tracking-wider font-semibold">
                  Complete mock interviews to visualize your progress.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Tips */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/45 backdrop-blur-md flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-lg font-serif font-bold text-gold-200 mb-4">Interviewer Insights</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-royal-bg/60 border border-gold-500/10 flex gap-3">
                  <div className="p-2 bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-450 h-fit shrink-0">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gold-200">Target Weak Topics</h4>
                    <p className="text-[11px] text-gold-200/50 mt-1 leading-relaxed font-light">
                      Check your category breakdown on the Analytics tab. Practicing technical answers generally boosts scores fastest.
                    </p>
                  </div>
                </div>
                {!stats.hasResume && (
                  <div className="p-4 rounded-2xl bg-gold-950/20 border border-gold-500/20 flex gap-3">
                    <div className="p-2 bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-400 h-fit shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300">Missing Resume</h4>
                      <p className="text-[11px] text-gold-200/50 mt-1 leading-relaxed font-light">
                        Gemini generates custom interview questions targeting the projects on your resume. Upload one now for a tailormade experience.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Link
              href="/analytics"
              className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-royal-bg/40 border border-gold-500/10 hover:bg-gold-950/15 hover:border-gold-500/30 text-xs font-bold uppercase tracking-widest text-gold-300 transition-all group"
            >
              <span>View Skill Analytics</span>
              <ChevronRight className="h-5 w-5 text-gold-500 group-hover:text-gold-200 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Interviews List */}
        <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/45 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-gold-200">Recent Interview Sessions</h2>
            <Link href="/interview" className="text-xs uppercase tracking-wider text-gold-400 hover:text-gold-200 font-bold transition-colors">
              View all
            </Link>
          </div>

          {interviews.length > 0 ? (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div 
                  key={interview.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-royal-bg/60 border border-gold-500/10 hover:border-gold-500/20 transition-all duration-300 gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-royal-card rounded-xl text-gold-400 border border-gold-500/10">
                      <Video className="h-5 w-5 text-gold-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gold-100">{interview.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gold-500 mt-1 font-medium">
                        <span>{interview.role}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
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

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-gold-500/10 sm:border-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest">Score</p>
                      <p className="text-sm font-bold text-gold-100 mt-0.5 font-serif">
                        {interview.score !== null ? `${interview.score}/10` : 'Incomplete'}
                      </p>
                    </div>

                    <Link
                      href={interview.score !== null ? `/interview/${interview.id}/feedback` : `/interview/${interview.id}`}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        interview.score !== null 
                          ? 'border-gold-500/15 hover:bg-gold-950/15 text-gold-300 hover:border-gold-500/30'
                          : 'bg-gold-500/10 border-gold-500/20 hover:bg-gold-500/20 text-gold-400'
                      }`}
                    >
                      {interview.score !== null ? 'View Feedback' : 'Resume Interview'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gold-500/10 rounded-2xl bg-royal-bg/30">
              <Video className="h-8 w-8 text-gold-500/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-gold-300">No mock interviews yet</p>
              <p className="text-xs text-gold-500 mt-1 mb-4 leading-relaxed font-light">Start your first session to receive instant AI evaluations.</p>
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-gradient border border-gold-300/20 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:opacity-90"
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
