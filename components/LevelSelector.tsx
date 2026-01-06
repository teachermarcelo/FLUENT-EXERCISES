
import React from 'react';
import { ProficiencyLevel } from '../types';

interface LevelSelectorProps {
  onSelect: (level: ProficiencyLevel) => void;
  onBack: () => void;
  embedded?: boolean;
}

const levels: { id: ProficiencyLevel; title: string; desc: string; color: string }[] = [
  { id: 'A1', title: 'Beginner', desc: 'Can understand basic everyday expressions and very simple phrases.', color: 'bg-emerald-500' },
  { id: 'A2', title: 'Elementary', desc: 'Can communicate in simple and routine tasks requiring a simple exchange.', color: 'bg-green-500' },
  { id: 'B1', title: 'Intermediate', desc: 'Can deal with most situations likely to arise whilst travelling.', color: 'bg-blue-500' },
  { id: 'B2', title: 'Upper Intermediate', desc: 'Can interact with a degree of fluency and spontaneity.', color: 'bg-indigo-500' },
  { id: 'C1', title: 'Advanced', desc: 'Can express ideas fluently and spontaneously without much obvious searching.', color: 'bg-purple-500' },
  { id: 'C2', title: 'Mastery', desc: 'Can understand with ease virtually everything heard or read.', color: 'bg-amber-500' },
];

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelect, onBack, embedded }) => {
  return (
    <div className={`${embedded ? 'p-10' : 'min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6'}`}>
      <div className={`${embedded ? '' : 'max-w-4xl w-full space-y-8 animate-fadeIn'}`}>
        <header className="text-center space-y-2 mb-10">
          {!embedded && (
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 mx-auto text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
          )}
          <h2 className="text-3xl font-bold font-heading text-slate-900">Select Your Level</h2>
          <p className="text-slate-500">Don't worry, you can always change this later.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className="bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`${level.color} text-white text-xs font-black px-3 py-1 rounded-full`}>{level.id}</span>
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{level.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{level.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;
