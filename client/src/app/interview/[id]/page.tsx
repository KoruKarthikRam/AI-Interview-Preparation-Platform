'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Timer, 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { interviewService, QuestionData } from '../../../services/api';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

export default function MockInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  // Timer settings
  const [timerDuration, setTimerDuration] = useState(60); // 30, 60, or 90
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition Hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    supported: speechSupported
  } = useSpeechRecognition();

  // Load Interview & Questions on mount
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await interviewService.get(interviewId);
        setInterview(data);
        setQuestions(data.questions || []);
        
        // Find the first unanswered question
        const unansweredIdx = (data.questions || []).findIndex((q: any) => !q.answer);
        if (unansweredIdx !== -1) {
          setCurrentIdx(unansweredIdx);
        } else if ((data.questions || []).length > 0) {
          // All answered, redirect to feedback if interview completed
          if (data.score !== null) {
            router.push(`/interview/${interviewId}/feedback`);
          } else {
            setCurrentIdx((data.questions || []).length - 1);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load this interview session.');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [interviewId, router]);

  const [recordingBaseText, setRecordingBaseText] = useState('');

  // Sync Speech transcript to text box
  useEffect(() => {
    if (isListening && transcript) {
      const base = recordingBaseText.trim();
      setAnswerText(base ? `${base} ${transcript}` : transcript);
    }
  }, [transcript, isListening, recordingBaseText]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(timerDuration);
    setTimerActive(true);
    setError('');
  }, [currentIdx, timerDuration]);

  // Countdown timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (isListening) {
        stopListening();
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, timeLeft, isListening]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setError('');
      setRecordingBaseText(answerText);
      resetTranscript();
      startListening();
    }
  };

  const handleTimerDurationChange = (duration: number) => {
    setTimerDuration(duration);
    setTimeLeft(duration);
  };

  const currentQuestion = questions[currentIdx];

  const handleAnswerSubmit = async () => {
    if (!currentQuestion) return;

    if (isListening) {
      stopListening();
    }

    setError('');
    setSubmittingAnswer(true);

    try {
      // 1. Submit answer text for grading
      await interviewService.submitAnswer(interviewId, currentQuestion.id, answerText);
      
      // 2. Fetch updated interview data to refresh progress
      const updatedData = await interviewService.get(interviewId);
      setQuestions(updatedData.questions || []);

      // 3. Advance to next question or show complete trigger
      setAnswerText('');
      resetTranscript();
      
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit and grade your answer. Please try again.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleCompleteInterview = async () => {
    setError('');
    setCompleting(true);
    try {
      await interviewService.complete(interviewId);
      router.push(`/interview/${interviewId}/feedback`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to calculate final mock score.');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
            <p className="text-gold-400 text-sm font-semibold tracking-wide animate-pulse">Initializing interview simulator...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentQuestion) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-gold-300">No questions found</h3>
          <p className="text-xs text-gold-500 mt-1">This interview session doesn't contain questions.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if all 10 questions have answers submitted
  const allAnswered = questions.every((q) => q.answer);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">
            <span>{interview?.title}</span>
            <span>Question {currentIdx + 1} of {questions.length}</span>
          </div>
          <div className="h-2 w-full bg-royal-bg rounded-full overflow-hidden border border-gold-500/10">
            <div 
              className="h-full bg-gold-gradient transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Panel */}
        <div className="p-6 md:p-8 rounded-3xl border border-gold-500/10 bg-royal-card/50 backdrop-blur-md space-y-4 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-royal-purple/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${
              currentQuestion.type === 'Technical'
                ? 'bg-blue-500/5 text-blue-400 border-blue-500/10'
                : currentQuestion.type === 'Project'
                ? 'bg-violet-500/5 text-violet-400 border-violet-500/10'
                : currentQuestion.type === 'Behavioral'
                ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
            }`}>
              {currentQuestion.type} Question
            </span>

            {/* Timer Options & Status */}
            <div className="flex items-center gap-4">
              <div className="flex bg-royal-bg/60 border border-gold-500/10 rounded-xl p-0.5 text-[9px] font-bold text-gold-500/70">
                {[30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleTimerDurationChange(d)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      timerDuration === d ? 'bg-gold-500/10 border border-gold-500/10 text-gold-300 font-extrabold' : 'hover:text-gold-300'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1 bg-royal-bg/60 border border-gold-500/10 rounded-xl text-xs font-bold ${
                timeLeft <= 10 && timeLeft > 0 ? 'text-rose-450 animate-pulse border-rose-500/30' : 'text-gold-250'
              }`}>
                <Timer className="h-4 w-4 text-gold-450" />
                <span>{timeLeft > 0 ? `${timeLeft}s` : 'Time\'s Up'}</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-serif leading-relaxed text-gold-100">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Answer Box */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gold-500/70 uppercase tracking-widest">
              Your Answer
            </label>
            <button
              onClick={() => {
                setAnswerText('');
                resetTranscript();
              }}
              className="flex items-center gap-1.5 text-xs text-gold-500 hover:text-gold-300 transition-colors cursor-pointer font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          <div className="relative">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder={
                isListening 
                  ? 'Listening... Speak clearly into your microphone.' 
                  : 'Type your answer details here, or click the mic button to answer by voice...'
              }
              rows={6}
              className="block w-full px-5 py-4 bg-royal-bg/40 border border-gold-500/10 rounded-3xl focus:ring-1 focus:ring-gold-500 focus:border-gold-500/50 text-gold-100 placeholder-gold-500/20 text-sm md:text-base leading-relaxed transition-all focus:outline-hidden resize-y min-h-[150px] font-sans"
            />

            {/* Audio soundwave mock overlay when listening */}
            {isListening && (
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-1 bg-gold-950/90 border border-gold-500/30 px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
                  <span className="text-[9px] text-gold-300 font-bold tracking-wider uppercase animate-pulse mr-2">
                    Speech Capture Active
                  </span>
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-0.75 bg-gold-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                    <span className="w-0.75 bg-gold-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.2s' }} />
                    <span className="w-0.75 bg-gold-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
                    <span className="w-0.75 bg-gold-400 rounded-full animate-bounce h-1" style={{ animationDelay: '0.4s' }} />
                    <span className="w-0.75 bg-gold-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              {speechSupported ? (
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-950/20 border-rose-900/30 text-rose-450 shadow-md shadow-rose-500/5'
                      : 'bg-royal-bg border-gold-500/10 hover:bg-gold-950/15 text-gold-300'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4.5 w-4.5 text-rose-400" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4.5 w-4.5 text-gold-400" />
                      Answer by Voice
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[10px] text-gold-500/50 font-bold uppercase tracking-widest flex items-center gap-1.5 p-2 border border-gold-500/10 rounded-xl bg-royal-bg/40">
                  <MicOff className="h-4 w-4" />
                  Voice inputs unsupported
                </span>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              {/* Question pagination jump (only if they have answers already saved) */}
              <div className="flex items-center gap-1 bg-royal-bg/40 border border-gold-500/10 rounded-2xl p-1 text-xs">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (q.answer || idx === currentIdx) {
                        setCurrentIdx(idx);
                        setAnswerText(q.answer?.answerText || '');
                      }
                    }}
                    disabled={!q.answer && idx !== currentIdx}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentIdx === idx
                        ? 'bg-gold-gradient text-black font-black'
                        : q.answer
                        ? 'bg-royal-card text-emerald-400 border border-emerald-500/10'
                        : 'text-gold-500/30'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Submit Answer Action */}
              <button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={submittingAnswer || !answerText.trim()}
                className="flex items-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest text-black bg-gold-gradient border border-gold-300/30 disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-[1.01] cursor-pointer"
              >
                {submittingAnswer ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    AI Evaluation...
                  </>
                ) : (
                  <>
                    {currentIdx === questions.length - 1 ? 'Save Answer' : 'Submit & Next'}
                    <ChevronRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex items-start gap-3 text-rose-450 text-xs mt-4">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Complete Trigger Panel */}
        {allAnswered && (
          <div className="p-6 rounded-3xl border border-gold-500/20 bg-gold-950/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 mt-8 animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-gold-400" />
              <div>
                <h4 className="font-bold text-gold-300 font-serif text-sm">All 10 Answers Completed!</h4>
                <p className="text-xs text-gold-200/50 mt-0.5 leading-relaxed font-light">Submit to Gemini to compile your report card feedback metrics.</p>
              </div>
            </div>
            <button
              onClick={handleCompleteInterview}
              disabled={completing}
              className="flex items-center gap-2 px-6 py-3.5 bg-gold-gradient text-black font-bold border border-gold-300/30 text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-gold-500/10 transition-all hover:scale-[1.02] cursor-pointer w-full md:w-auto justify-center"
            >
              {completing ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-black" />
                  Completing...
                </>
              ) : (
                <>
                  Generate Report Card
                  <ArrowRight className="h-4.5 w-4.5 text-black" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
