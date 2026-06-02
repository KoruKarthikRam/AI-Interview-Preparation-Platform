'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Calendar, 
  BookOpen,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { analyticsService } from '../../services/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    avgScore: 0,
    totalAnswers: 0,
  });
  const [scoreTrend, setScoreTrend] = useState<any[]>([]);
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsService.get();
        setStats(data.stats);
        setScoreTrend(data.scoreTrend);
        setTopicStats(data.topicStats);

        // Generate personalized study recommendations based on topic scores
        const recs: string[] = [];
        let lowTech = false;
        let lowProj = false;
        let lowBeh = false;
        let lowHR = false;

        data.topicStats.forEach((topic: any) => {
          if (topic.count > 0 && topic.score < 7.0) {
            if (topic.topic === 'Technical') lowTech = true;
            if (topic.topic === 'Project-Based') lowProj = true;
            if (topic.topic === 'Behavioral') lowBeh = true;
            if (topic.topic === 'HR Fit') lowHR = true;
          }
        });

        // Default recommendations if no mock interviews yet
        if (data.stats.completedInterviews === 0) {
          recs.push('Complete your first mock interview to activate customized AI study roadmaps.');
          recs.push('Practice answering technical questions by writing out structured paragraphs detailing system concepts.');
          recs.push('Record voice answers to build flow, confidence, and pacing.');
        } else {
          if (lowTech) {
            recs.push('(Recommended) Study foundational Data Structures & Algorithms, database normalization, indexing, and REST API conventions.');
          }
          if (lowProj) {
            recs.push('(Recommended) Structure your project answers. Be ready to explain database design choices, optimization techniques, and scaling bottlenecks you solved.');
          }
          if (lowBeh) {
            recs.push('(Recommended) Apply the STAR method (Situation, Task, Action, Result) to format scenario questions, emphasizing quantifiable results.');
          }
          if (lowHR) {
            recs.push('(Recommended) Align your background descriptions with target company values and practice clean, structured personal introductions.');
          }
          if (recs.length === 0) {
            recs.push('Outstanding performance! Keep refining your skills by taking Hard difficulty interviews.');
            recs.push('Focus on reducing response times under the 60-second limit.');
          }
        }
        setRecommendations(recs);

      } catch (err: any) {
        console.error('Failed to load analytics', err);
        setError('Failed to fetch detailed analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-zinc-400 text-sm">Compiling statistics reports...</p>
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
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Analytics
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Review average scores, topic-based breakdown, and customized study tips.</p>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex items-center gap-5">
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Average Grade</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {stats.avgScore > 0 ? `${stats.avgScore}/10` : 'N/A'}
              </h3>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex items-center gap-5">
            <div className="p-3.5 bg-violet-500/10 rounded-2xl text-violet-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Interviews Completed</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats.completedInterviews}</h3>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex items-center gap-5">
            <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Questions Answered</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats.totalAnswers}</h3>
            </div>
          </div>
        </div>

        {/* Graphs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Area Chart */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md">
            <h3 className="font-bold text-zinc-200 text-sm mb-6 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Score History Trend
            </h3>
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
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                  Complete mock interviews to view historical score trends.
                </div>
              )}
            </div>
          </div>

          {/* Topic Performance Bar Chart */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md">
            <h3 className="font-bold text-zinc-200 text-sm mb-6 flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
              Performance by Interview Category
            </h3>
            <div className="h-64 w-full">
              {isMounted && stats.completedInterviews > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="topic" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} domain={[0, 10]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" fill="#818cf8" radius={[8, 8, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                  Complete mock interviews to see category-specific score breakdowns.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customized Study Recommendation Panel */}
        <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-zinc-200 text-sm">Personalized Prep Roadmap</h3>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                  rec.startsWith('(Recommended)')
                    ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300'
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-400'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 h-fit ${
                  rec.startsWith('(Recommended)') ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-900 text-zinc-500'
                }`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-300 mb-0.5">
                    {rec.startsWith('(Recommended)') ? 'Skill Improvement Action' : 'General Prep Advice'}
                  </h4>
                  <p>{rec.replace('(Recommended) ', '')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
