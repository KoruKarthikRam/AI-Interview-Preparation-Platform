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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            <p className="text-gold-400 text-sm font-semibold tracking-wide animate-pulse">Compiling your feedback report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !interview) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Info className="h-10 w-10 text-rose-450 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-gold-300">Report not found</h3>
          <p className="text-xs text-gold-500 mt-1">This interview session feedback is unavailable.</p>
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
            className="flex items-center gap-1.5 text-xs text-gold-500/70 hover:text-gold-200 font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to mock list
          </Link>
        </div>

        {/* Top Report summary banner */}
        <div className="p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/85 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-48 h-48 bg-royal-purple/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${
                interview.difficulty === 'Easy'
                  ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                  : interview.difficulty === 'Medium'
                  ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                  : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
              }`}>
                {interview.difficulty}
              </span>
              <span className="text-xs text-gold-500/75 flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5 text-gold-500/50" />
                Completed {new Date(interview.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-gold-gradient">{interview.title}</h1>
            
            <p className="text-xs md:text-sm text-gold-200/60 leading-relaxed font-light">
              {interview.feedback}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-royal-bg border border-gold-500/15 p-6 rounded-3xl min-w-[200px] justify-center shadow-inner">
            <Award className="h-10 w-10 text-gold-400 shrink-0" />
            <div>
              <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest leading-none">Overall Score</p>
              <h2 className="text-4xl font-extrabold text-gold-100 mt-2 leading-none font-serif">
                {interview.score}<span className="text-lg text-gold-550/40 font-semibold">/10</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Detailed Inspector Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions Sidebar (Left) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-serif font-bold text-gold-200 text-sm">Question Index</h3>
            
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
                        ? 'bg-gold-500/10 border-gold-500'
                        : 'bg-royal-bg/60 border-gold-500/10 hover:border-gold-500/20 hover:bg-gold-950/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`h-6 w-6 rounded-lg text-[9px] font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-gold-gradient text-black' : 'bg-royal-card text-gold-400/65 border border-gold-500/10'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className={`text-xs truncate font-semibold ${isSelected ? 'text-gold-200' : 'text-gold-400/80'}`}>
                        {q.questionText}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border shrink-0 ${getScoreColor(score)}`}>
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
              <div className="p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md space-y-6 animate-fade-in shadow-sm">
                {/* Question Info */}
                <div className="space-y-2 border-b border-gold-500/10 pb-4">
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
                  <h3 className="text-lg font-bold font-serif text-gold-100 leading-snug">
                    {selectedQuestion.questionText}
                  </h3>
                </div>

                {/* Candidate Answer */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gold-500/50 uppercase tracking-widest">Your Answer</h4>
                  <div className="p-4 bg-royal-bg/60 border border-gold-500/10 rounded-2xl text-xs md:text-sm text-gold-200/70 leading-relaxed font-light font-sans whitespace-pre-wrap select-text">
                    {selectedQuestion.answer ? (
                      selectedQuestion.answer.answerText
                    ) : (
                      <span className="italic text-gold-500/30">No answer provided.</span>
                    )}
                  </div>
                </div>

                {/* Evaluation Feedback */}
                {selectedQuestion.answer && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Score badge details */}
                    <div className="md:col-span-1 p-5 rounded-2xl border border-gold-500/10 bg-royal-bg/60 flex flex-col justify-center items-center text-center shadow-inner">
                      <p className="text-[9px] text-gold-500/50 font-bold uppercase tracking-widest leading-none">Question Score</p>
                      <h3 className={`text-4xl font-extrabold mt-3 font-serif ${getScoreColor(selectedQuestion.answer.score).split(' ')[0]}`}>
                        {selectedQuestion.answer.score}<span className="text-base text-gold-550/40 font-semibold">/10</span>
                      </h3>
                    </div>
                    
                    {/* Gemini breakdown details */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-gold-250/80 flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4 text-gold-400" />
                          AI Evaluator Feedback
                        </h4>
                        <p className="text-xs text-gold-200/60 leading-relaxed font-light">
                          {selectedQuestion.answer.feedback}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-gold-500/10 pt-3">
                        <h4 className="text-xs font-bold text-gold-400 flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                          <Sparkles className="h-4 w-4 text-gold-400" />
                          Actionable Improvement Tips
                        </h4>
                        <p className="text-xs text-gold-200/60 leading-relaxed font-light">
                          {selectedQuestion.answer.improvement}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center border border-gold-500/10 rounded-3xl bg-royal-card/10 text-gold-500/30 text-xs font-bold uppercase tracking-wider">
                Select a question on the left to inspect evaluations.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
