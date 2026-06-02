'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { resumeService } from '../../services/api';

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await resumeService.getLatest();
        setResumeData(data);
      } catch (err: any) {
        // 404 is normal if the user hasn't uploaded a resume yet
        if (err.message && !err.message.includes('404') && !err.message.includes('not found')) {
          setError('Failed to fetch resume analysis records.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadResume();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Only PDF resume files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const data = await resumeService.upload(file);
      setResumeData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload and analyze resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-zinc-400 text-sm">Loading resume records...</p>
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
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Resume Analyzer
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Upload your resume PDF to extract skills and evaluate ATS matching gaps.</p>
        </div>

        {/* Upload Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`p-8 rounded-3xl border-2 border-dashed flex flex-col items-center text-center justify-center cursor-pointer transition-all duration-300 min-h-[300px] ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]' 
                  : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 hover:bg-zinc-900/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <div>
                    <h4 className="font-bold text-zinc-200">Analyzing Resume...</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Gemini is parsing skills, projects, and finding missing gaps.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-zinc-200 text-sm">Drag & Drop Resume PDF</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 mb-4">or click to browse local files</p>
                  <span className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg text-[10px] uppercase font-semibold">
                    PDF (Max 5MB)
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 text-xs">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="p-5 bg-zinc-900/20 border border-zinc-800/40 rounded-3xl">
              <div className="flex gap-3 text-zinc-400">
                <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-2">
                  <h4 className="font-bold text-zinc-300">Why upload your resume?</h4>
                  <p className="leading-relaxed">
                    By parsing your resume text, our built-in Gemini engine will target specific questions about your real projects, database structures, and development frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis View */}
          <div className="lg:col-span-2">
            {resumeData ? (
              <div className="space-y-6">
                {/* Resume Header Info */}
                <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/15 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-indigo-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-200 text-sm leading-none">{resumeData.fileName}</h3>
                      <p className="text-[11px] text-zinc-500 mt-1">Processed successfully</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    <span>Analyzed {new Date(resumeData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skills Found */}
                  <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/15 backdrop-blur-md">
                    <h3 className="font-bold text-zinc-200 text-sm mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      Extracted Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.length > 0 ? (
                        resumeData.skills.map((skill: string) => (
                          <span 
                            key={skill} 
                            className="px-3 py-1.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-xs">No skills identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/15 backdrop-blur-md">
                    <h3 className="font-bold text-zinc-200 text-sm mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                      Missing Skills (Gap Analysis)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.missingSkills.length > 0 ? (
                        resumeData.missingSkills.map((skill: string) => (
                          <span 
                            key={skill} 
                            className="px-3 py-1.5 bg-amber-500/5 text-amber-400 border border-amber-500/10 rounded-xl text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-xs">Excellent coverage! No major gaps detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/15 backdrop-blur-md space-y-4">
                    <h3 className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      Resume Strengths
                    </h3>
                    <ul className="space-y-3">
                      {resumeData.strengths.map((str: string, index: number) => (
                        <li key={index} className="text-xs text-zinc-400 leading-relaxed flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 bg-emerald-400 rounded-full shrink-0"></span>
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-6 rounded-3xl border border-zinc-800/40 bg-zinc-900/15 backdrop-blur-md space-y-4">
                    <h3 className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                      {resumeData.weaknesses.map((weak: string, index: number) => (
                        <li key={index} className="text-xs text-zinc-400 leading-relaxed flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 bg-rose-400 rounded-full shrink-0"></span>
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-zinc-800/40 rounded-3xl bg-zinc-900/10">
                <FileText className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-base font-bold text-zinc-400">No Resume Records Found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Upload your professional resume PDF on the left to activate detailed skill profiles and custom AI question generation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
