'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Terminal, 
  PlusCircle, 
  HelpCircle, 
  ChevronRight, 
  Award,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { leetcodeService, LeetCodeSessionData } from '../../services/api';

// LeetCode Logo SVG Icon
const LeetCodeLogo = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414 0-1.954l-2.36-2.36a.607.607 0 0 0-.859 0l-.942.942a.607.607 0 0 0 0 .859l.867.868c.57.57.57 1.503 0 2.073l-1.071 1.071a.607.607 0 0 1-.859 0L8.76 14.156a.607.607 0 0 1 0-.859l4.55-4.55a.607.607 0 0 1 .859 0l.942.942a.607.607 0 0 0 .859 0l2.36-2.36c.54-.54.54-1.414 0-1.954l-2.396-2.392a5.45 5.45 0 0 0-3.84-1.579zM10.15 13.91l-.942.942a.607.607 0 0 0 0 .859l2.36 2.36c.54.54 1.414.54 1.954 0l2.396-2.392a.607.607 0 0 0 0-.859l-2.36-2.36a.607.607 0 0 0-.859 0l-.942.942a.607.607 0 0 1-.859 0l-.867-.868c-.57-.57-.57-1.503 0-2.073l1.071-1.071a.607.607 0 0 0 0-.859L11.58 7.37a.607.607 0 0 0-.859 0l-4.55 4.55a.607.607 0 0 0 0 .859l.942.942a.607.607 0 0 1 0 .859l.867.868c.57.57 1.503.57 2.073 0l1.071-1.071a.607.607 0 0 0 0-.859z" />
  </svg>
);

// Helper to convert problem title to LeetCode URL
const getLeetCodeUrl = (title: string) => {
  const cleanedTitle = title.replace(/^\d+[\s.-]+/, '');
  const slug = cleanedTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `https://leetcode.com/problems/${slug}/`;
};

export default function LeetCodeModePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState<Omit<LeetCodeSessionData, 'problemDescription' | 'aiEvaluation'>[]>([]);
  const [error, setError] = useState('');

  // Setup form states
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays']);
  const [difficulty, setDifficulty] = useState<string>('Medium');

  const topicsList = ['Arrays', 'DP', 'Graphs', 'Trees'];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await leetcodeService.list();
        setSessions(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load past coding rounds.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };

  const handleStartRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }
    setError('');
    setCreating(true);

    try {
      const session = await leetcodeService.create(selectedTopics, difficulty);
      router.push(`/leetcode/${session.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start interview round.');
      setCreating(false);
    }
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'text-zinc-500 border-zinc-800 bg-zinc-950/20';
    if (score >= 8) return 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">
            <Terminal className="h-8 w-8 text-indigo-400" />
            LeetCode Interview Mode
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Simulate a real-world technical coding round. Select topics, explain your approach, and get graded on optimality.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Round (Left/Middle) */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md space-y-6">
            <h2 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-400" />
              Configure Coding Session
            </h2>

            <form onSubmit={handleStartRound} className="space-y-6">
              {/* Topics selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-400">Select DSA Topics</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {topicsList.map(topic => {
                    const isChecked = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => handleTopicToggle(topic)}
                        className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                            : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-400">Difficulty</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Easy', 'Medium', 'Hard'].map(diff => {
                    const isChecked = difficulty === diff;
                    return (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`p-3 rounded-xl border text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isChecked
                            ? diff === 'Easy'
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                              : diff === 'Medium'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                              : 'bg-rose-500/10 border-rose-500 text-rose-400'
                            : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/15"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Generating Custom DSA Challenge...
                  </>
                ) : (
                  <>Start Interview Round</>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info (Right) */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">How it works</h3>
              
              <div className="space-y-4 text-xs text-zinc-400 leading-relaxed font-medium">
                <div className="flex gap-3">
                  <span className="h-5 w-5 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-lg font-bold shrink-0">1</span>
                  <p>AI generates a tailored LeetCode problem based on your chosen topics and difficulty.</p>
                </div>
                <div className="flex gap-3">
                  <span className="h-5 w-5 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-lg font-bold shrink-0">2</span>
                  <p>Read the description and write down your conceptual approach (Time/Space complexities, data structures, algorithms).</p>
                </div>
                <div className="flex gap-3">
                  <span className="h-5 w-5 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-lg font-bold shrink-0">3</span>
                  <p>AI evaluates your correctness, logic details, edge cases, and provides recommendations for optimization.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex gap-3 text-xs text-zinc-500 font-medium">
              <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0" />
              <p>This mode simulates a Google or Meta technical phone screen where the interviewer grades your strategy before coding.</p>
            </div>
          </div>
        </div>

        {/* History of Rounds */}
        <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md">
          <h2 className="text-lg font-bold text-zinc-200 mb-6">Past LeetCode Rounds</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((sess) => {
                const topicsArr: string[] = JSON.parse(sess.topics || '[]');
                return (
                  <div
                    key={sess.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-all gap-4 animate-fade-in"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-800">
                        <BookOpen className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200">{sess.problemTitle}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            sess.difficulty === 'Easy'
                              ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                              : sess.difficulty === 'Medium'
                              ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                              : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                          }`}>
                            {sess.difficulty}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(sess.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <div className="flex gap-1">
                            {topicsArr.map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-zinc-900 sm:border-0 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Grade</p>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border mt-0.5 ${getScoreColor(sess.score)}`}>
                          {sess.score ? `${sess.score}/10` : 'Ungraded'}
                        </span>
                      </div>

                      <a
                        href={getLeetCodeUrl(sess.problemTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900 text-[#FFA116] hover:text-[#FFB84D] rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 shrink-0"
                        title="Solve on LeetCode"
                      >
                        <LeetCodeLogo className="h-5 w-5" />
                      </a>

                      <Link
                        href={`/leetcode/${sess.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-800 hover:bg-zinc-900 text-zinc-300 flex items-center gap-1 transition-all cursor-pointer group"
                      >
                        {sess.score ? 'View Review' : 'Resume Session'}
                        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
              <Terminal className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-400">No mock LeetCode rounds yet</p>
              <p className="text-xs text-zinc-500 mt-1">Configure and start a new round above.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
