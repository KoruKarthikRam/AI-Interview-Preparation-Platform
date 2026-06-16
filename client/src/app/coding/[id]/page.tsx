'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Code, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import CodeEditor from '../../../components/CodeEditor';
import { codingService, CodingAssessmentData } from '../../../services/api';

export default function CodingActiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<CodingAssessmentData | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await codingService.get(assessmentId);
        setAssessment(data);
        if (data.code) {
          setCode(data.code);
        } else {
          setCode(data.starterCode);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to retrieve assessment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please write some code before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const updated = await codingService.submitCode(assessmentId, code);
      setAssessment(updated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit code.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            <p className="text-gold-400 text-sm font-semibold tracking-wide animate-pulse">Compiling workspace and loading template...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assessment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-10 w-10 text-rose-450 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-gold-300">Assessment not found</h3>
          <p className="text-xs text-gold-500 mt-1">This code assessment session could not be retrieved.</p>
          <Link href="/coding" className="mt-6 inline-block px-4 py-2 bg-gold-950/10 border border-gold-500/20 text-xs font-bold uppercase tracking-wider text-gold-300 rounded-xl hover:bg-gold-950/30">
            Back to Coding Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isGraded = assessment.score !== null && assessment.score !== undefined;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-[95rem] mx-auto">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/coding"
            className="flex items-center gap-1.5 text-xs text-gold-500/70 hover:text-gold-200 font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to coding list
          </Link>
        </div>

        {/* Header Banner */}
        <div className="p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/80 backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-48 h-48 bg-royal-purple/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${
                assessment.difficulty === 'Easy'
                  ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                  : assessment.difficulty === 'Medium'
                  ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                  : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
              }`}>
                {assessment.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-royal-bg border border-gold-500/10 text-[9px] font-bold uppercase tracking-wider text-gold-400/80">
                {assessment.language}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-gold-gradient flex items-center gap-3">
              <FileCode className="h-7 w-7 text-gold-400" />
              {assessment.problemTitle}
            </h1>
          </div>

          {isGraded && (
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border shrink-0 ${getScoreColor(assessment.score || 0)}`}>
              <Award className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold leading-none">Code Grade</p>
                <h3 className="text-2xl font-extrabold mt-1 leading-none font-serif">{assessment.score}<span className="text-xs font-semibold">/10</span></h3>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Split screen Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Block: Description (5 cols) */}
          <div className="lg:col-span-5 p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md space-y-6 overflow-y-auto max-h-[75vh]">
            <h2 className="text-lg font-serif font-bold text-gold-200 border-b border-gold-500/10 pb-3">Problem Details</h2>
            <div className="text-gold-100/85 text-sm font-medium leading-relaxed whitespace-pre-wrap select-text">
              {assessment.problemDescription}
            </div>
          </div>

          {/* Right Block: IDE and Results (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {!isGraded ? (
              // Stage: Active code compilation
              <div className="space-y-4">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={assessment.language}
                />

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitCode}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gold-gradient text-black text-xs font-bold uppercase tracking-widest rounded-xl border border-gold-300/30 shadow-lg shadow-gold-500/10 hover:opacity-90 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                        AI reviewing submission...
                      </>
                    ) : (
                      <>Submit Solution</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Stage: Review output
              <div className="p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md space-y-6 shadow-sm">
                <div className="border-b border-gold-500/10 pb-4">
                  <h2 className="text-lg font-serif font-bold text-gold-200">AI Evaluation Feedback</h2>
                  <p className="text-xs text-gold-200/60 leading-relaxed font-light mt-1.5">{assessment.feedback}</p>
                </div>

                {/* Theoretical Complexity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-gold-500/10 bg-royal-bg/60 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gold-450 shrink-0" />
                    <div>
                      <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest">Calculated Time</p>
                      <p className="text-xs font-bold text-gold-200 mt-0.5 font-mono">{assessment.timeComplexity || 'O(N)'}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-gold-500/10 bg-royal-bg/60 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-gold-450 shrink-0" />
                    <div>
                      <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest">Calculated Space</p>
                      <p className="text-xs font-bold text-gold-200 mt-0.5 font-mono">{assessment.spaceComplexity || 'O(N)'}</p>
                    </div>
                  </div>
                </div>

                {/* Subsections */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gold-250/80 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Edge Cases Evaluation
                    </h4>
                    <p className="text-xs text-gold-200/60 leading-relaxed font-light">
                      {assessment.edgeCases || 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-gold-500/10 pt-3">
                    <h4 className="text-xs font-bold text-gold-250/80 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4 text-gold-400" />
                      Code Quality & Idioms
                    </h4>
                    <p className="text-xs text-gold-200/60 leading-relaxed font-light">
                      {assessment.codeQuality || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Code copy block */}
                <div className="space-y-2 pt-2 border-t border-gold-500/10">
                  <h4 className="text-[10px] text-gold-500/50 font-bold uppercase tracking-widest">Submitted Code</h4>
                  <pre className="p-4 rounded-xl bg-royal-bg/60 border border-gold-500/10 text-xs text-gold-200/50 font-mono overflow-auto max-h-48 leading-relaxed select-text">
                    <code>{assessment.code}</code>
                  </pre>
                </div>

                <div className="flex gap-4 border-t border-gold-500/10 pt-6">
                  <button
                    onClick={() => {
                      setAssessment(prev => prev ? { ...prev, score: null } : null);
                    }}
                    className="flex-1 py-3 border border-gold-500/15 bg-royal-bg hover:bg-gold-950/15 text-gold-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Edit Code again
                  </button>
                  <Link
                    href="/coding"
                    className="flex-1 block text-center py-3 bg-gold-gradient border border-gold-300/30 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer hover:opacity-90"
                  >
                    Select Another Problem
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
