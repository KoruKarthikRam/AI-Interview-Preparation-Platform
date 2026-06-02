'use client';

import React, { useEffect, useState } from 'react';
import { 
  Map, 
  PlusCircle, 
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Award
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { roadmapService, RoadmapData, RoadmapResult } from '../../services/api';

export default function CareerRoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [roadmaps, setRoadmaps] = useState<Omit<RoadmapData, 'roadmapData'>[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);
  const [error, setError] = useState('');

  // Form states
  const [skills, setSkills] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  // Expandable week index
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true });
  // Local state for checking topics
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const list = await roadmapService.list();
        setRoadmaps(list);
        if (list.length > 0) {
          // Fetch the latest full roadmap details
          const latest = await roadmapService.get(list[0].id);
          setActiveRoadmap(latest);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load preparation roadmaps.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, []);

  const handleSelectRoadmap = async (id: string) => {
    setError('');
    setLoading(true);
    try {
      const fullRoadmap = await roadmapService.get(id);
      setActiveRoadmap(fullRoadmap);
      // Reset expansions
      setExpandedWeeks({ 1: true });
    } catch (err: any) {
      console.error(err);
      setError('Failed to load the selected roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim() || !targetCompany.trim()) {
      setError('Please provide current skills and target company.');
      return;
    }
    setError('');
    setGenerating(true);

    try {
      const newRoadmap = await roadmapService.create(skills, targetCompany);
      setActiveRoadmap(newRoadmap);
      
      // Update list
      const updatedList = await roadmapService.list();
      setRoadmaps(updatedList);
      
      // Reset form & expansions
      setSkills('');
      setTargetCompany('');
      setExpandedWeeks({ 1: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeekExpand = (weekNum: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const toggleTopicCheck = (topicKey: string) => {
    setCheckedTopics(prev => ({
      ...prev,
      [topicKey]: !prev[topicKey]
    }));
  };

  // Safe parse for roadmapData JSON
  let roadmapJSON: RoadmapResult | null = null;
  if (activeRoadmap?.roadmapData) {
    try {
      roadmapJSON = JSON.parse(activeRoadmap.roadmapData);
    } catch (e) {
      console.error('Error parsing roadmapData:', e);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-[95rem] mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">
            <Map className="h-8 w-8 text-indigo-400" />
            AI Career Roadmap Generator
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Map your current technologies to your dream company. Get an optimized week-by-week learning blueprint.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Layout Split: Left Generator / History, Right Active Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Generate form */}
            <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md space-y-6">
              <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-400" />
                Plan New Roadmap
              </h2>

              <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Current Skills</label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Java, SQL, basic HTML"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-900 bg-zinc-950/60 focus:border-indigo-500 text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Target Company</label>
                  <input
                    type="text"
                    required
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. Amazon, Google, Stripe"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-900 bg-zinc-950/60 focus:border-indigo-500 text-zinc-200 placeholder-zinc-700 text-xs focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all"
                >
                  {generating ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                      Structuring Study Plan...
                    </>
                  ) : (
                    <>Generate Weekly Roadmap</>
                  )}
                </button>
              </form>
            </div>

            {/* Previous Roadmaps */}
            <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-zinc-300">Your Roadmaps</h3>
              
              {roadmaps.length > 0 ? (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {roadmaps.map((r) => {
                    const isSelected = activeRoadmap?.id === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectRoadmap(r.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
                            : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-zinc-200">{r.targetCompany} Prep Plan</p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">Skills: {r.skills}</p>
                        </div>
                        <Calendar className="h-4 w-4 text-zinc-600 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-600 italic">
                  No roadmaps generated yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Timeline (8 cols) */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex h-[40vh] items-center justify-center p-8 border border-zinc-800/40 rounded-3xl bg-zinc-900/10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : activeRoadmap && roadmapJSON ? (
              // Timeline layout
              <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/60 bg-zinc-900/10 backdrop-blur-md space-y-8 animate-fade-in">
                {/* Title */}
                <div className="border-b border-zinc-900 pb-5 space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-xl font-extrabold text-zinc-100">{roadmapJSON.title}</h2>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{roadmapJSON.summary}</p>
                  <div className="flex gap-4 pt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Target: <strong className="text-zinc-300">{activeRoadmap.targetCompany}</strong></span>
                    <span>•</span>
                    <span>Skills: <strong className="text-zinc-300">{activeRoadmap.skills}</strong></span>
                  </div>
                </div>

                {/* Vertical Timeline container */}
                <div className="relative border-l border-zinc-850 ml-4 pl-8 space-y-6">
                  {roadmapJSON.weeks.map((week) => {
                    const isExpanded = !!expandedWeeks[week.week];
                    return (
                      <div key={week.week} className="relative group transition-all">
                        {/* Timeline Circle Node */}
                        <span className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full border-4 flex items-center justify-center font-bold text-[10px] transition-all z-10 ${
                          isExpanded 
                            ? 'bg-indigo-600 border-zinc-950 text-white scale-110 shadow-lg shadow-indigo-600/35'
                            : 'bg-zinc-900 border-zinc-950 text-zinc-500 group-hover:border-zinc-800'
                        }`}>
                          {week.week}
                        </span>

                        {/* Week Card */}
                        <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-850 transition-all space-y-4">
                          {/* Toggle Header */}
                          <button
                            onClick={() => toggleWeekExpand(week.week)}
                            className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-200 cursor-pointer focus:outline-none"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-300 font-extrabold">{week.title}</span>
                              <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850">
                                <Clock className="h-3 w-3 text-indigo-400" />
                                {week.estimatedHours} hrs
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                          </button>

                          {/* Collapsible Content */}
                          {isExpanded && (
                            <div className="space-y-4 text-xs leading-relaxed text-zinc-400 border-t border-zinc-900 pt-4 animate-fade-in font-medium">
                              <p className="text-zinc-500 font-medium">{week.description}</p>
                              
                              {/* Checklist */}
                              <div className="space-y-2">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sub-topics checklist</p>
                                
                                <div className="space-y-2.5">
                                  {week.topics.map((topic) => {
                                    const key = `${week.week}-${topic}`;
                                    const isChecked = !!checkedTopics[key];
                                    return (
                                      <button
                                        type="button"
                                        key={topic}
                                        onClick={() => toggleTopicCheck(key)}
                                        className="flex items-center gap-2.5 text-left text-xs font-semibold text-zinc-300 cursor-pointer focus:outline-none hover:text-white"
                                      >
                                        {isChecked ? (
                                          <CheckSquare className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                                        ) : (
                                          <Square className="h-4.5 w-4.5 text-zinc-700 shrink-0" />
                                        )}
                                        <span className={isChecked ? 'line-through text-zinc-600' : ''}>{topic}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Empty State
              <div className="h-[50vh] flex flex-col items-center justify-center text-center border border-zinc-800/40 rounded-3xl bg-zinc-900/10 text-zinc-500 text-xs">
                <Compass className="h-10 w-10 text-zinc-700 mb-3 animate-pulse" />
                <h3 className="font-bold text-zinc-400 text-sm">No Active Roadmap</h3>
                <p className="mt-1 max-w-sm">Use the planning panel on the left to generate your weekly career learning blueprint.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
