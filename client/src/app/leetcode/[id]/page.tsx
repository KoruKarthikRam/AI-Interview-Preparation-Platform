'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Terminal, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { leetcodeService, LeetCodeSessionData } from '../../../services/api';

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

export default function LeetCodeActiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<LeetCodeSessionData | null>(null);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await leetcodeService.get(sessionId);
        setSession(data);
        if (data.userExplanation) {
          setExplanation(data.userExplanation);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to retrieve session details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleSubmitApproach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setError('Please provide an explanation.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const updated = await leetcodeService.submitExplanation(sessionId, explanation);
      setSession(updated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit explanation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-zinc-400 text-sm">Loading problem statement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">Session not found</h3>
          <p className="text-sm text-zinc-500 mt-1">This LeetCode session could not be retrieved.</p>
          <Link href="/leetcode" className="mt-4 inline-block px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs font-semibold rounded-xl text-zinc-300 hover:bg-zinc-800">
            Back to LeetCode Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const topicsArr: string[] = JSON.parse(session.topics || '[]');
  const isGraded = session.score !== null && session.score !== undefined;
  
  // Parse AI Evaluation JSON safely
  let evaluationData: any = null;
  if (isGraded && session.aiEvaluation) {
    try {
      evaluationData = JSON.parse(session.aiEvaluation);
    } catch (e) {
      console.error('Error parsing evaluation JSON:', e);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/leetcode"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to LeetCode Mode
          </Link>
        </div>

        {/* Problem Header Banner */}
        <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/40 via-zinc-900/10 to-zinc-950/20 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
              session.difficulty === 'Easy'
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                : session.difficulty === 'Medium'
                ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
            }`}>
              {session.difficulty}
            </span>
            <div className="flex gap-1.5">
              {topicsArr.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-850 text-[10px] font-semibold text-zinc-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <Terminal className="h-6 w-6 text-indigo-400" />
              {session.problemTitle}
            </h1>
            
            <a
              href={getLeetCodeUrl(session.problemTitle)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs font-bold bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 text-zinc-300 hover:text-white flex items-center gap-2.5 transition-all cursor-pointer group shrink-0 rounded-xl"
              title="Open on LeetCode"
            >
              <LeetCodeLogo className="h-5 w-5 text-[#FFA116] group-hover:scale-110 transition-transform" />
              <span>Solve on LeetCode</span>
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Pane: Problem Description */}
          <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md space-y-6 overflow-y-auto max-h-[70vh]">
            <h2 className="text-lg font-bold text-zinc-200 border-b border-zinc-900 pb-3">Problem Statement</h2>
            <div className="text-zinc-300 text-sm font-medium leading-relaxed whitespace-pre-wrap select-text">
              {session.problemDescription}
            </div>
          </div>

          {/* Right Pane: User Action or Evaluation Results */}
          <div className="space-y-8">
            {!isGraded ? (
              // Stage: Input Explanation
              <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-zinc-200">Explain Your Solution</h2>
                  <p className="text-zinc-500 text-xs mt-1">
                    Describe your algorithm in detail. Include your approach, what data structures you would use, why they fit, and the time and space complexity.
                  </p>
                </div>

                <form onSubmit={handleSubmitApproach} className="space-y-4">
                  <textarea
                    rows={12}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Example: I will use a Hash Map to store elements we have seen so far. As we iterate through the array, we check if target - current_value is already in the Hash Map. If it is, we return the pair..."
                    className="w-full p-4 rounded-2xl border border-zinc-900 bg-zinc-950/60 hover:border-zinc-800 focus:border-indigo-500 text-zinc-200 placeholder-zinc-700 text-sm font-mono focus:outline-none transition-all leading-relaxed"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Interviewer evaluating approach...
                      </>
                    ) : (
                      <>Submit Solution Approach</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Stage: Evaluation Results
              <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/60 bg-zinc-900/10 backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-200">AI Evaluation Report</h2>
                    <p className="text-zinc-500 text-xs mt-0.5">Mock Coding Round feedback</p>
                  </div>
                  
                  {/* Score badge */}
                  <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border shrink-0 ${getScoreColor(session.score || 0)}`}>
                    <Award className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-bold leading-none">Score</p>
                      <h3 className="text-2xl font-extrabold mt-1 leading-none">{session.score}<span className="text-xs font-semibold">/10</span></h3>
                    </div>
                  </div>
                </div>

                {/* Complexity Summary Cards */}
                {evaluationData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950/40 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Optimal Time</p>
                        <p className="text-xs font-bold text-zinc-300 mt-0.5">{evaluationData.timeComplexityOptimal || 'O(N)'}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950/40 flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Optimal Space</p>
                        <p className="text-xs font-bold text-zinc-300 mt-0.5">{evaluationData.spaceComplexityOptimal || 'O(N)'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Review Card */}
                {evaluationData && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                        Approach Analysis
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {evaluationData.feedback}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-zinc-900 pt-3">
                      <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <HelpCircle className="h-4 w-4 text-indigo-400" />
                        Correctness & Data Structures
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {evaluationData.correctnessDetails}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-zinc-900 pt-3">
                      <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        Actionable Recommendations
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {evaluationData.improvement}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-zinc-900 pt-4">
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Your Explanation</h4>
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 text-xs text-zinc-400 font-mono leading-relaxed select-text">
                    {session.userExplanation}
                  </div>
                </div>

                <Link
                  href="/leetcode"
                  className="w-full block text-center py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Configure Another Session
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
