'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Code, 
  PlusCircle, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  HelpCircle,
  FileCode,
  Laptop
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { codingService, CodingAssessmentData } from '../../services/api';

export default function CodingDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assessments, setAssessments] = useState<Omit<CodingAssessmentData, 'problemDescription' | 'starterCode'>[]>([]);
  const [error, setError] = useState('');

  // Setup form states
  const [language, setLanguage] = useState<string>('python');
  const [difficulty, setDifficulty] = useState<string>('Medium');

  const languagesList = [
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'java', name: 'Java', ext: '.java' },
    { id: 'cpp', name: 'C++', ext: '.cpp' },
  ];

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await codingService.list();
        setAssessments(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load past assessments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const assessment = await codingService.create(language, difficulty);
      router.push(`/coding/${assessment.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate coding assessment.');
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
            <Code className="h-8 w-8 text-indigo-400" />
            Live Coding Assessment
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Solve DSA problems in our integrated IDE. AI will review your time/space complexity, edge cases, and code quality.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Card */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md space-y-6">
            <h2 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
              <Laptop className="h-5 w-5 text-indigo-400" />
              Configure Assessment
            </h2>

            <form onSubmit={handleStartAssessment} className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-zinc-400">Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {languagesList.map(lang => {
                    const isChecked = language === lang.id;
                    return (
                      <button
                        type="button"
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 font-bold text-sm transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                            : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-[10px] text-zinc-600 font-semibold">{lang.ext}</span>
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

              {/* Start Button */}
              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/15"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Generating Boilerplate Code...
                  </>
                ) : (
                  <>Open Code Editor</>
                )}
              </button>
            </form>
          </div>

          {/* Guidelines */}
          <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-200">Evaluation Criteria</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Our AI compiler evaluates code submissions on industry-standard engineering benchmarks:
              </p>

              <div className="space-y-3 text-xs text-zinc-500 leading-relaxed font-medium">
                <div className="flex gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <p><strong className="text-zinc-300">Complexity</strong>: Calculates exact big-O runtimes and checks if optimal data structures were utilized.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <p><strong className="text-zinc-300">Edge Cases</strong>: Highlights failures like array index bounds, null pointers, negative integers, or division by zero.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <p><strong className="text-zinc-300">Code Quality</strong>: Analyzes modularity, spacing, variable naming, and idiomatic correctness.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex gap-3 text-xs text-zinc-500 font-medium">
              <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0" />
              <p>Supports full keyboard navigation and indentation typical of modern programming setups.</p>
            </div>
          </div>
        </div>

        {/* History of assessments */}
        <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/10 backdrop-blur-md">
          <h2 className="text-lg font-bold text-zinc-200 mb-6">Past Assessments</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 transition-all gap-4 animate-fade-in"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400 border border-zinc-800">
                      <FileCode className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">{a.problemTitle}</h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                        <span className="uppercase">{a.language}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          a.difficulty === 'Easy'
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                            : a.difficulty === 'Medium'
                            ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                            : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                        }`}>
                          {a.difficulty}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-zinc-900 sm:border-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Score</p>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border mt-0.5 ${getScoreColor(a.score)}`}>
                        {a.score ? `${a.score}/10` : 'Ungraded'}
                      </span>
                    </div>

                    <Link
                      href={`/coding/${a.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-800 hover:bg-zinc-900 text-zinc-300 flex items-center gap-1 transition-all cursor-pointer group"
                    >
                      {a.score ? 'View Review' : 'Code Now'}
                      <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
              <Code className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-zinc-400">No assessments completed yet</p>
              <p className="text-xs text-zinc-500 mt-1">Configure and start a new problem above.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
