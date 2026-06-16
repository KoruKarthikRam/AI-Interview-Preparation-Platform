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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            <p className="text-gold-400 text-sm font-semibold tracking-wide animate-pulse">Compiling statistics reports...</p>
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
            Analytics
          </h1>
          <p className="text-gold-200/50 text-xs mt-1 font-medium tracking-wide">Review average scores, topic-based breakdown, and customized study tips.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 text-xs">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 rounded-2xl text-gold-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">Average Grade</p>
              <h3 className="text-2xl font-bold font-serif text-gold-100 mt-1">
                {stats.avgScore > 0 ? `${stats.avgScore}/10` : 'N/A'}
              </h3>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className="p-3.5 bg-royal-purple/20 border border-royal-purple-light/20 rounded-2xl text-royal-purple-light">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-royal-purple-light/75 font-bold uppercase tracking-widest">Interviews Completed</p>
              <h3 className="text-2xl font-bold font-serif text-gold-100 mt-1">{stats.completedInterviews}</h3>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md flex items-center gap-5 shadow-sm shadow-gold-500/2 hover:border-gold-500/20 transition-all duration-300">
            <div className="p-3.5 bg-gold-400/10 border border-gold-400/20 rounded-2xl text-gold-300">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-gold-400/70 font-bold uppercase tracking-widest">Total Questions Answered</p>
              <h3 className="text-2xl font-bold font-serif text-gold-100 mt-1">{stats.totalAnswers}</h3>
            </div>
          </div>
        </div>

        {/* Graphs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Area Chart */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md shadow-sm shadow-gold-500/2">
            <h3 className="font-bold font-serif text-gold-200 text-sm mb-6 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-gold-400" />
              Score History Trend
            </h3>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 160, 89, 0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(197, 160, 89, 0.4)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(197, 160, 89, 0.4)" fontSize={11} domain={[0, 10]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09070f', borderColor: 'rgba(197, 160, 89, 0.2)', borderRadius: '16px', color: '#fcfbfa' }}
                      labelStyle={{ color: '#ebdcb0', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#c5a059" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gold-500/40 text-xs font-medium">
                  Complete mock interviews to view historical score trends.
                </div>
              )}
            </div>
          </div>

          {/* Topic Performance Bar Chart */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md shadow-sm shadow-gold-500/2">
            <h3 className="font-bold font-serif text-gold-200 text-sm mb-6 flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-gold-400" />
              Performance by Interview Category
            </h3>
            <div className="h-64 w-full">
              {isMounted && stats.completedInterviews > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ebdcb0" />
                        <stop offset="100%" stopColor="#c5a059" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 160, 89, 0.08)" vertical={false} />
                    <XAxis dataKey="topic" stroke="rgba(197, 160, 89, 0.4)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(197, 160, 89, 0.4)" fontSize={11} domain={[0, 10]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09070f', borderColor: 'rgba(197, 160, 89, 0.2)', borderRadius: '16px', color: '#fcfbfa' }}
                      labelStyle={{ color: '#ebdcb0', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" fill="url(#barColor)" radius={[8, 8, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gold-500/40 text-xs font-medium">
                  Complete mock interviews to see category-specific score breakdowns.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customized Study Recommendation Panel */}
        <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/60 backdrop-blur-md shadow-sm shadow-gold-500/2">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-gold-400" />
            <h3 className="font-bold font-serif text-gold-200 text-sm">Personalized Prep Roadmap</h3>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const isRecommended = rec.startsWith('(Recommended)');
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed transition-all duration-300 hover:scale-[1.005] ${
                    isRecommended
                      ? 'bg-royal-purple/5 border-royal-purple/20 text-royal-purple-light'
                      : 'bg-gold-950/5 border-gold-500/10 text-gold-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 h-fit ${
                    isRecommended 
                      ? 'bg-royal-purple/10 text-royal-purple-light border border-royal-purple-light/20' 
                      : 'bg-gold-950/15 text-gold-400 border border-gold-500/15'
                  }`}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold font-serif mb-0.5 text-sm tracking-wide">
                      {isRecommended ? 'Skill Improvement Action' : 'General Prep Advice'}
                    </h4>
                    <p className={isRecommended ? 'text-gold-100/90 font-medium' : 'text-gold-200/70 font-medium'}>
                      {rec.replace('(Recommended) ', '')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
