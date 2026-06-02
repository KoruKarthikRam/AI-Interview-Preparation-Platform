'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Info,
  Calendar,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import DashboardLayout from '../../../../components/DashboardLayout';
import { interviewService, InterviewData } from '../../../../services/api';

export default function InterviewFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await interviewService.get(interviewId);
        
        // If interview not finished/graded yet, send back to interview
        if (data.score === null || data.score === undefined) {
          router.push(`/interview/${interviewId}`);
          return;
        }
        
        setInterview(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load interview report card.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [interviewId, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-zinc-400 text-sm">Compiling your feedback report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !interview) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Info className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">Report not found</h3>
          <p className="text-sm text-zinc-500 mt-1">This interview session feedback is unavailable.</p>
        </div>
      </DashboardLayout>
    );
  }

  const questions = interview.questions || [];
  const selectedQuestion = questions[selectedIdx];

  // Helper to color code scores
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5';
    if (score >= 6) return 'text-amber-400 border-amber-500/10 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/10 bg-rose-500/5';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Navigation back */}
        <div className="flex items-center gap-4">
          <Link
            href="/interview"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to mock list
          </Link>
        </div>

        {/* Top Report summary banner */}
        <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/40 via-zinc-900/10 to-zinc-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                interview.difficulty === 'Easy'
                  ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                  : interview.difficulty === 'Medium'
                  ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                  : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
              }`}>
                {interview.difficulty}
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Completed {new Date(interview.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">{interview.title}</h1>
            
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-medium">
              {interview.feedback}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-zinc-950/40 border border-zinc-900 p-6 rounded-3xl min-w-[200px] justify-center">
            <Award className="h-10 w-10 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Overall Score</p>
              <h2 className="text-4xl font-extrabold text-white mt-2 leading-none">
                {interview.score}<span className="text-lg text-zinc-600 font-semibold">/10</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Detailed Inspector Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions Sidebar (Left) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-zinc-300 text-sm">Question Index</h3>
            
            <div className="space-y-2.5">
              {questions.map((q, idx) => {
                const isSelected = selectedIdx === idx;
                const score = q.answer?.score || 0;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/40'
                        : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`h-6 w-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-850'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className={`text-xs truncate font-medium ${isSelected ? 'text-zinc-200' : 'text-zinc-400'}`}>
                        {q.questionText}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${getScoreColor(score)}`}>
                      {score}/10
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Inspector Pane (Right) */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <div className="p-6 md:p-8 rounded-3xl border border-zinc-800/60 bg-zinc-900/10 backdrop-blur-md space-y-6 animate-fade-in">
                {/* Question Info */}
                <div className="space-y-2 border-b border-zinc-900 pb-4">
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${
                    selectedQuestion.type === 'Technical'
                      ? 'bg-blue-500/5 text-blue-400 border-blue-500/10'
                      : selectedQuestion.type === 'Project'
                      ? 'bg-violet-500/5 text-violet-400 border-violet-500/10'
                      : selectedQuestion.type === 'Behavioral'
                      ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                      : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                  }`}>
                    {selectedQuestion.type} Focus
                  </span>
                  <h3 className="text-lg font-bold text-zinc-100 leading-snug">
                    {selectedQuestion.questionText}
                  </h3>
                </div>

                {/* Candidate Answer */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Your Answer</h4>
                  <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl text-xs md:text-sm text-zinc-400 leading-relaxed font-medium">
                    {selectedQuestion.answer ? (
                      selectedQuestion.answer.answerText
                    ) : (
                      <span className="italic text-zinc-600">No answer provided.</span>
                    )}
                  </div>
                </div>

                {/* Evaluation Feedback */}
                {selectedQuestion.answer && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Score badge details */}
                    <div className="md:col-span-1 p-5 rounded-2xl border border-zinc-900 bg-zinc-950/20 flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Question Score</p>
                      <h3 className={`text-4xl font-extrabold mt-3 ${getScoreColor(selectedQuestion.answer.score).split(' ')[0]}`}>
                        {selectedQuestion.answer.score}<span className="text-base text-zinc-600">/10</span>
                      </h3>
                    </div>
                    
                    {/* Gemini breakdown details */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                          AI Evaluator Feedback
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {selectedQuestion.answer.feedback}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
                        <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-400" />
                          Actionable Improvement Tips
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {selectedQuestion.answer.improvement}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center border border-zinc-800/40 rounded-3xl bg-zinc-900/10 text-zinc-500 text-xs">
                Select a question on the left to inspect evaluations.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
