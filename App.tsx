
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DiagnosticTest from './components/DiagnosticTest';
import LessonPlayer from './components/LessonPlayer';
import AIConversation from './components/AIConversation';
import LevelSelector from './components/LevelSelector';
import Modules from './components/Modules';
import { UserProgress, ProficiencyLevel } from './types';

const INITIAL_PROGRESS: UserProgress = {
  level: 'A1',
  xp: 0,
  streak: 0,
  completedLessons: [],
  skills: {
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0
  }
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<UserProgress | null>(() => {
    const saved = localStorage.getItem('lingua_leap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [flow, setFlow] = useState<'welcome' | 'diagnostic' | 'picker'>(user ? 'welcome' : 'welcome');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem('lingua_leap_user', JSON.stringify(user));
    }
  }, [user]);

  const handleSetLevel = (level: ProficiencyLevel) => {
    const newUser: UserProgress = user ? { ...user, level } : { ...INITIAL_PROGRESS, level };
    setUser(newUser);
    setFlow('welcome');
    navigate('/dashboard');
  };

  if (!user && flow === 'welcome') {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-[40px] shadow-2xl p-10 text-center space-y-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor"/>
            </svg>
          </div>
          <header>
            <h1 className="text-3xl font-bold font-heading text-slate-900">Welcome to LinguaLeap</h1>
            <p className="text-slate-500 mt-2">How would you like to start your journey?</p>
          </header>
          <div className="space-y-4">
            <button 
              onClick={() => setFlow('diagnostic')}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Take Diagnostic Test
            </button>
            <button 
              onClick={() => setFlow('picker')}
              className="w-full py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
            >
              Choose Level Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user && flow === 'diagnostic') {
    return <DiagnosticTest onComplete={handleSetLevel} onBack={() => setFlow('welcome')} />;
  }

  if (!user && flow === 'picker') {
    return <LevelSelector onSelect={handleSetLevel} onBack={() => setFlow('welcome')} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user!} onLevelClick={() => setFlow('picker')} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user!} />} />
            <Route path="/lesson/:id" element={<LessonPlayer user={user!} onUpdateProgress={setUser} />} />
            <Route path="/practice/chat" element={<AIConversation user={user!} />} />
            <Route path="/modules" element={<Modules user={user!} />} />
            <Route path="/level-select" element={<LevelSelector onSelect={handleSetLevel} onBack={() => navigate(-1)} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      {(flow === 'picker' && user) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative overflow-hidden">
              <button onClick={() => setFlow('welcome')} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <LevelSelector onSelect={handleSetLevel} onBack={() => setFlow('welcome')} embedded />
           </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
