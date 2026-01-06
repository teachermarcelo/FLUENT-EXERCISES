
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProgress, ProficiencyLevel } from '../types';

const allModules = [
  // --- NÍVEL A1 (50 TÓPICOS) ---
  { id: 'a1-1', level: 'A1', title: 'Greetings & Introductions', category: 'Everyday', lessons: 4 },
  { id: 'a1-2', level: 'A1', title: 'The Alphabet & Spelling', category: 'Everyday', lessons: 2 },
  { id: 'a1-3', level: 'A1', title: 'Numbers 1-100', category: 'Everyday', lessons: 3 },
  { id: 'a1-4', level: 'A1', title: 'Telling the Time', category: 'Everyday', lessons: 3 },
  { id: 'a1-5', level: 'A1', title: 'Days, Months & Seasons', category: 'Everyday', lessons: 4 },
  { id: 'a1-6', level: 'A1', title: 'Colors & Basic Shapes', category: 'Everyday', lessons: 2 },
  { id: 'a1-7', level: 'A1', title: 'Family Members', category: 'Everyday', lessons: 4 },
  { id: 'a1-8', level: 'A1', title: 'Describing Your Home', category: 'Everyday', lessons: 5 },
  { id: 'a1-9', level: 'A1', title: 'Daily Routine: Morning', category: 'Everyday', lessons: 4 },
  { id: 'a1-10', level: 'A1', title: 'Daily Routine: Evening', category: 'Everyday', lessons: 4 },
  { id: 'a1-11', level: 'A1', title: 'At the Supermarket', category: 'Everyday', lessons: 5 },
  { id: 'a1-12', level: 'A1', title: 'Ordering a Coffee', category: 'Everyday', lessons: 3 },
  { id: 'a1-13', level: 'A1', title: 'Common Fruits & Vegetables', category: 'Everyday', lessons: 4 },
  { id: 'a1-14', level: 'A1', title: 'Basic Kitchenware', category: 'Everyday', lessons: 3 },
  { id: 'a1-15', level: 'A1', title: 'Describing People: Face', category: 'Everyday', lessons: 4 },
  { id: 'a1-16', level: 'A1', title: 'Clothes & Accessories', category: 'Everyday', lessons: 5 },
  { id: 'a1-17', level: 'A1', title: 'Transportation: Bus & Taxi', category: 'Travel', lessons: 4 },
  { id: 'a1-18', level: 'A1', title: 'Transportation: Trains', category: 'Travel', lessons: 4 },
  { id: 'a1-19', level: 'A1', title: 'Asking for Directions', category: 'Travel', lessons: 5 },
  { id: 'a1-20', level: 'A1', title: 'At the Airport: Check-in', category: 'Travel', lessons: 6 },
  { id: 'a1-21', level: 'A1', title: 'In the Hotel: Reception', category: 'Travel', lessons: 5 },
  { id: 'a1-22', level: 'A1', title: 'Countries & Nationalities', category: 'Travel', lessons: 4 },
  { id: 'a1-23', level: 'A1', title: 'Weather Basics', category: 'Everyday', lessons: 3 },
  { id: 'a1-24', level: 'A1', title: 'Hobbies & Free Time', category: 'Everyday', lessons: 5 },
  { id: 'a1-25', level: 'A1', title: 'Sports & Equipment', category: 'Everyday', lessons: 4 },
  { id: 'a1-26', level: 'A1', title: 'Common Jobs & Offices', category: 'Business', lessons: 5 },
  { id: 'a1-27', level: 'A1', title: 'At the Doctor: Symptoms', category: 'Everyday', lessons: 6 },
  { id: 'a1-28', level: 'A1', title: 'Animals: Pets', category: 'Everyday', lessons: 3 },
  { id: 'a1-29', level: 'A1', title: 'Animals: Farm & Wild', category: 'Everyday', lessons: 4 },
  { id: 'a1-30', level: 'A1', title: 'Classroom Objects', category: 'Academic', lessons: 3 },
  { id: 'a1-31', level: 'A1', title: 'Feelings & Emotions', category: 'Everyday', lessons: 5 },
  { id: 'a1-32', level: 'A1', title: 'Simple Verbs of Action', category: 'Everyday', lessons: 6 },
  { id: 'a1-33', level: 'A1', title: 'Likes & Dislikes', category: 'Everyday', lessons: 4 },
  { id: 'a1-34', level: 'A1', title: 'Shopping for Clothes', category: 'Everyday', lessons: 5 },
  { id: 'a1-35', level: 'A1', title: 'Paying the Bill', category: 'Everyday', lessons: 3 },
  { id: 'a1-36', level: 'A1', title: 'Parts of the Body', category: 'Everyday', lessons: 5 },
  { id: 'a1-37', level: 'A1', title: 'Furniture in the Living Room', category: 'Everyday', lessons: 4 },
  { id: 'a1-38', level: 'A1', title: 'Digital Devices', category: 'Tech', lessons: 3 },
  { id: 'a1-39', level: 'A1', title: 'Internet & Social Media', category: 'Tech', lessons: 4 },
  { id: 'a1-40', level: 'A1', title: 'Writing a Simple Email', category: 'Business', lessons: 5 },
  { id: 'a1-41', level: 'A1', title: 'Phone Call Basics', category: 'Everyday', lessons: 4 },
  { id: 'a1-42', level: 'A1', title: 'Music Genres', category: 'Everyday', lessons: 3 },
  { id: 'a1-43', level: 'A1', title: 'At the Cinema', category: 'Everyday', lessons: 4 },
  { id: 'a1-44', level: 'A1', title: 'Nature: Parks & Gardens', category: 'Everyday', lessons: 4 },
  { id: 'a1-45', level: 'A1', title: 'Office Supplies', category: 'Business', lessons: 3 },
  { id: 'a1-46', level: 'A1', title: 'Prepositions of Place', category: 'Everyday', lessons: 5 },
  { id: 'a1-47', level: 'A1', title: 'Quantity: Much & Many', category: 'Academic', lessons: 4 },
  { id: 'a1-48', level: 'A1', title: 'Question Words: Who, What, Where', category: 'Academic', lessons: 5 },
  { id: 'a1-49', level: 'A1', title: 'Common Adjectives (Opposites)', category: 'Everyday', lessons: 6 },
  { id: 'a1-50', level: 'A1', title: 'Closing a Conversation', category: 'Everyday', lessons: 3 },

  // --- EXEMPLOS DE OUTROS NÍVEIS ---
  { id: 'a2-1', level: 'A2', title: 'At the Restaurant', category: 'Travel', lessons: 5 },
  { id: 'b1-1', level: 'B1', title: 'Work Meetings', category: 'Business', lessons: 6 },
  { id: 'b2-1', level: 'B2', title: 'Job Interviews', category: 'Business', lessons: 8 },
  { id: 'c1-1', level: 'C1', title: 'Public Speaking', category: 'Academic', lessons: 10 },
  { id: 'c2-1', level: 'C2', title: 'Philosophy & Logic', category: 'Academic', lessons: 12 },
];

const Modules: React.FC<{ user: UserProgress }> = ({ user }) => {
  const [filterLevel, setFilterLevel] = useState<ProficiencyLevel | 'All'>('All');
  
  const levels: (ProficiencyLevel | 'All')[] = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filtered = allModules.filter(m => filterLevel === 'All' || m.level === filterLevel);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 py-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-heading">Course Modules</h2>
          <p className="text-slate-500 mt-1">Explore {filtered.length} units in your curriculum.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto shadow-sm no-scrollbar">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filterLevel === lvl ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
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
            className={`bg-white rounded-[32px] border-2 transition-all p-6 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 ${
              module.level === user.level ? 'border-indigo-100 ring-2 ring-indigo-50/50' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  module.level.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                  module.level.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {module.level}
                </span>
                {module.level === user.level && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 animate-pulse">
                    Current
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400">{module.category}</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{module.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{module.lessons} Interactive Tasks</p>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                 <span className="text-xs font-medium text-slate-400">
                   {user.completedLessons.includes(module.id) ? 'Completed' : 'Locked'}
                 </span>
               </div>
               <Link 
                 to={`/lesson/${module.id}`} 
                 className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                   module.level === user.level 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                 }`}
                >
                 Enter
               </Link>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No modules found for this level yet.</p>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Modules;
