'use client';

import React, { useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Split value by newline to compute number of lines
  const lines = value.split('\n');

  // Intercept scroll event to sync line numbers pane scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Capture tab key presses and insert spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 4 spaces
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);

      // Reset cursor position after React update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="flex rounded-2xl border border-zinc-900 bg-zinc-950/80 overflow-hidden font-mono text-sm leading-relaxed relative min-h-[400px]">
      {/* Language Indicator */}
      <div className="absolute right-4 top-2 text-[10px] uppercase font-bold text-zinc-600 bg-zinc-900/60 border border-zinc-900 px-2 py-0.5 rounded-md pointer-events-none select-none z-10">
        {language}
      </div>

      {/* Line Numbers Left Panel */}
      <div
        ref={lineNumbersRef}
        className="w-12 bg-zinc-950 text-right pr-3 pl-1 select-none text-zinc-700 border-r border-zinc-900 overflow-hidden py-4 text-xs font-semibold"
        style={{ scrollbarWidth: 'none' }}
      >
        {lines.map((_, i) => (
          <div key={i} className="h-[21px]">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Main Textarea input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-zinc-200 p-4 outline-none resize-none font-mono text-xs overflow-y-auto leading-[21px]"
        placeholder="// Write your code here..."
        spellCheck={false}
      />
    </div>
  );
}
