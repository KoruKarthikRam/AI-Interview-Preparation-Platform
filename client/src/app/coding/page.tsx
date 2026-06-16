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
    if (!score) return 'text-gold-500 border-gold-500/15 bg-royal-bg/40';
    if (score >= 8) return 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide font-serif text-gold-gradient flex items-center gap-3">
            <Code className="h-8 w-8 text-gold-400" />
            Live Coding Assessment
          </h1>
          <p className="text-gold-200/50 text-xs mt-1 font-medium tracking-wide">
            Solve DSA problems in our integrated IDE. AI will review your time/space complexity, edge cases, and code quality.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Card */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md space-y-6">
            <h2 className="text-xl font-serif font-bold text-gold-200 flex items-center gap-2">
              <Laptop className="h-5 w-5 text-gold-400" />
              Configure Assessment
            </h2>

            <form onSubmit={handleStartAssessment} className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gold-200/70">Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {languagesList.map(lang => {
                    const isChecked = language === lang.id;
                    return (
                      <button
                        type="button"
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-gold-500/10 border-gold-500 text-gold-300'
                            : 'bg-royal-bg border-gold-500/5 hover:border-gold-500/20 text-gold-500'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-[9px] text-gold-500/40 font-bold">{lang.ext}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gold-200/70">Difficulty</label>
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
                            : 'bg-royal-bg border-gold-500/5 hover:border-gold-500/20 text-gold-500/70'
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
                className="w-full flex items-center justify-center gap-2 py-4 bg-gold-gradient hover:opacity-90 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-widest rounded-2xl border border-gold-300/30 shadow-lg shadow-gold-500/10"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                    Generating Boilerplate Code...
                  </>
                ) : (
                  <>Open Code Editor</>
                )}
              </button>
            </form>
          </div>

          {/* Guidelines */}
          <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-gold-200">Evaluation Criteria</h3>
              <p className="text-xs text-gold-200/60 leading-relaxed font-light">
                Our AI compiler evaluates code submissions on industry-standard engineering benchmarks:
              </p>

              <div className="space-y-3 text-xs text-gold-200/50 leading-relaxed font-light">
                <div className="flex gap-2">
                  <span className="text-gold-400 font-bold">•</span>
                  <p><strong className="text-gold-300 font-semibold">Complexity</strong>: Calculates exact big-O runtimes and checks if optimal data structures were utilized.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-gold-400 font-bold">•</span>
                  <p><strong className="text-gold-300 font-semibold">Edge Cases</strong>: Highlights failures like array index bounds, null pointers, negative integers, or division by zero.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-gold-400 font-bold">•</span>
                  <p><strong className="text-gold-300 font-semibold">Code Quality</strong>: Analyzes modularity, spacing, variable naming, and idiomatic correctness.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-royal-bg border border-gold-500/10 flex gap-3 text-xs text-gold-250/50 font-medium leading-relaxed">
              <HelpCircle className="h-5 w-5 text-gold-450 shrink-0" />
              <p>Supports full keyboard navigation and indentation typical of modern programming setups.</p>
            </div>
          </div>
        </div>

        {/* History of assessments */}
        <div className="p-6 rounded-3xl border border-gold-500/10 bg-royal-card/45 backdrop-blur-md">
          <h2 className="text-lg font-serif font-bold text-gold-200 mb-6">Past Assessments</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-500 border-t-transparent"></div>
            </div>
          ) : assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-royal-bg/60 border border-gold-500/10 hover:border-gold-500/20 transition-all duration-300 gap-4 animate-fade-in shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-royal-card rounded-xl text-gold-400 border border-gold-500/10">
                      <FileCode className="h-5 w-5 text-gold-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gold-100">{a.problemTitle}</h4>
                      <div className="flex items-center gap-3 text-xs text-gold-500 mt-1 font-medium">
                        <span className="uppercase">{a.language}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
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
                          <Calendar className="h-3 w-3 text-gold-500/50" />
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-gold-500/10 sm:border-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest">Score</p>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border mt-0.5 font-serif ${getScoreColor(a.score)}`}>
                        {a.score ? `${a.score}/10` : 'Ungraded'}
                      </span>
                    </div>

                    <Link
                      href={`/coding/${a.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-gold-500/15 hover:bg-gold-950/15 hover:border-gold-500/35 text-gold-300 flex items-center gap-1 transition-all cursor-pointer group"
                    >
                      {a.score ? 'View Review' : 'Code Now'}
                      <ChevronRight className="h-4 w-4 text-gold-500 group-hover:text-gold-200 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gold-500/10 rounded-2xl bg-royal-bg/30">
              <Code className="h-8 w-8 text-gold-500/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-gold-300">No assessments completed yet</p>
              <p className="text-xs text-gold-500 mt-1 mb-4 leading-relaxed font-light">Configure and start a new problem above.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
