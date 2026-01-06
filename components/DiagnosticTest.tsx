
import React, { useState, useEffect } from 'react';
import { ProficiencyLevel } from '../types.ts';
import { getDiagnosticResult } from '../geminiService.ts';

interface DiagnosticTestProps {
  onComplete: (level: ProficiencyLevel) => void;
  onBack: () => void;
}

interface TestResult {
  level: string;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
}

const PLACEMENT_QUESTIONS = [
  { id: 1, q: "Introduce yourself briefly. What is your name and where are you from?", placeholder: "I am...", level: "A1" },
  { id: 2, q: "What do you usually do on weekends?", placeholder: "On weekends I like to...", level: "A1" },
  { id: 3, q: "Describe your family and your home.", placeholder: "I live in a...", level: "A1" },
  { id: 4, q: "What did you do yesterday?", placeholder: "Yesterday I...", level: "A2" },
  { id: 5, q: "Imagine you are at a restaurant. How would you order a meal?", placeholder: "I would like to...", level: "A2" },
  { id: 6, q: "What are your plans for the next summer vacation?", placeholder: "I am going to...", level: "A2" },
  { id: 7, q: "Talk about a movie or book you really liked and why.", placeholder: "My favorite movie is...", level: "B1" },
  { id: 8, q: "What do you think is the most important invention in history?", placeholder: "In my opinion...", level: "B1" },
  { id: 9, q: "How has technology changed the way we communicate?", placeholder: "Technology has...", level: "B1" },
  { id: 10, q: "If you could change one thing about your country, what would it be?", placeholder: "If I could, I would...", level: "B2" },
  { id: 11, q: "Should social media companies be responsible for the content users post?", placeholder: "I believe that...", level: "B2" },
  { id: 12, q: "Discuss the pros and cons of remote work.", placeholder: "One advantage is...", level: "C1" },
  { id: 13, q: "Explain the concept of 'sustainability' in your own words.", placeholder: "Sustainability means...", level: "C1" },
  { id: 14, q: "How do you think globalization affects cultural identity?", placeholder: "Globalization is a double-edged sword because...", level: "C2" },
  { id: 15, q: "Critique the role of artificial intelligence in modern education.", placeholder: "While AI offers many benefits...", level: "C2" }
];

const DiagnosticTest: React.FC<DiagnosticTestProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<{ question: string, answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleNext = async () => {
    if (!currentAnswer.trim()) return;

    const newResponses = [...responses, { question: PLACEMENT_QUESTIONS[step].q, answer: currentAnswer }];
    setResponses(newResponses);
    setCurrentAnswer('');

    if (step < PLACEMENT_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        const finalResult = await getDiagnosticResult(newResponses);
        setResult(finalResult);
      } catch (error) {
        console.error("Evaluation failed", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white max-w-3xl w-full rounded-[48px] shadow-2xl p-12 overflow-hidden border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-indigo-50 rounded-3xl mb-4">
              <span className="text-4xl font-black text-indigo-600 font-heading">{result.level}</span>
            </div>
            <h2 className="text-3xl font-bold font-heading text-slate-900">Placement Result</h2>
            <p className="text-slate-500 mt-2">Based on your 15 responses, here is your proficiency profile.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
              <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Focus Areas
              </h3>
              <ul className="space-y-2">
                {result.areasToImprove.map((a, i) => (
                  <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0"></span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[32px] mb-10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Teacher's Summary</h4>
            <p className="text-slate-700 leading-relaxed italic">"{result.feedback}"</p>
          </div>

          <button
            onClick={() => onComplete(result.level as ProficiencyLevel)}
            className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
          >
            Start Learning Path
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white max-w-2xl w-full rounded-[48px] shadow-2xl p-12 relative overflow-hidden transition-all">
        {isLoading ? (
          <div className="text-center py-20 space-y-8 animate-pulse">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold font-heading text-slate-900">Analysing Mastery...</h2>
              <p className="text-slate-500 max-w-sm mx-auto">Gemini is evaluating your linguistic patterns to create your adaptive learning path.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-fadeIn">
            <header className="flex items-center justify-between">
              <div className="flex-1">
                <button 
                  onClick={onBack} 
                  className="group text-slate-400 hover:text-indigo-600 mb-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                  </svg>
                  Abort Test
                </button>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">
                    {PLACEMENT_QUESTIONS[step].level} TARGET
                  </span>
                  <h2 className="text-4xl font-bold font-heading text-slate-900">Placement Test</h2>
                </div>
              </div>
              <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex flex-col items-center justify-center text-slate-400">
                <span className="text-xl font-black text-indigo-600">{step + 1}</span>
                <span className="text-[10px] font-bold uppercase">of 15</span>
              </div>
            </header>

            <div className="space-y-6">
              <label className="block text-2xl font-semibold text-slate-800 leading-tight">
                {PLACEMENT_QUESTIONS[step].q}
              </label>
              <textarea
                autoFocus
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={PLACEMENT_QUESTIONS[step].placeholder}
                className="w-full h-44 p-8 bg-slate-50 rounded-[32px] border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none text-xl resize-none shadow-inner"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleNext}
                disabled={!currentAnswer.trim()}
                className="flex-1 py-5 bg-indigo-600 text-white rounded-[24px] text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {step === PLACEMENT_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div
            className="h-full bg-indigo-600 transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
