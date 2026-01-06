
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProgress, ProficiencyLevel } from '../types';

const allModules = [
  { id: 'm1', level: 'A1', title: 'Basics: Greetings & Self', category: 'Everyday', lessons: 4 },
  { id: 'm2', level: 'A1', title: 'Numbers & Time', category: 'Everyday', lessons: 3 },
  { id: 'm3', level: 'A2', title: 'At the Restaurant', category: 'Travel', lessons: 5 },
  { id: 'm4', level: 'B1', title: 'Work Meetings', category: 'Business', lessons: 6 },
  { id: 'm5', level: 'B2', title: 'Job Interviews', category: 'Business', lessons: 8 },
  { id: 'm6', level: 'C1', title: 'Public Speaking', category: 'Academic', lessons: 10 },
  { id: 'm7', level: 'C2', title: 'Philosophy & Logic', category: 'Academic', lessons: 12 },
];

const Modules: React.FC<{ user: UserProgress }> = ({ user }) => {
  const [filterLevel, setFilterLevel] = useState<ProficiencyLevel | 'All'>('All');
  
  const levels: (ProficiencyLevel | 'All')[] = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filtered = allModules.filter(m => filterLevel === 'All' || m.level === filterLevel);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-heading">Course Modules</h2>
          <p className="text-slate-500 mt-1">Explore all content available across proficiency levels.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filterLevel === lvl ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((module) => (
          <div 
            key={module.id} 
            className={`bg-white rounded-[32px] border-2 transition-all p-6 flex flex-col shadow-sm hover:shadow-md ${
              module.level === user.level ? 'border-indigo-100 ring-2 ring-indigo-50' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                module.level.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                module.level.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                Level {module.level}
              </span>
              <span className="text-xs font-bold text-slate-400">{module.category}</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{module.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{module.lessons} Interactive Lessons</p>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
               <span className="text-xs font-medium text-slate-400">
                 {user.completedLessons.includes(module.id) ? '✅ Completed' : '0% Progress'}
               </span>
               <Link 
                 to={`/lesson/${module.id}`} 
                 className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                   module.level === user.level 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                 }`}
                >
                 Enter
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
