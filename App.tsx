
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonPlayer from './components/LessonPlayer';
import AIConversation from './components/AIConversation';
import Modules from './components/Modules';
import AdminTab from './components/AdminTab';
import TeacherTab from './components/TeacherTab';
import NotificationTab from './components/NotificationTab';
import Login from './components/Login';
import { UserProgress } from './types';

const initDB = () => {
  try {
    const dbStr = localStorage.getItem('lingualeap_db');
    let db: UserProgress[] = dbStr ? JSON.parse(dbStr) : [];
    
    const hasAdmin = db.some(u => u.username.toLowerCase() === 'admin');
    const hasMarcelo = db.some(u => u.username.toLowerCase() === 'teacher marcelo');

    let updated = false;

    if (!hasAdmin) {
      db.push({
        id: 'admin-0',
        username: 'admin',
        password: '123',
        role: 'admin',
        level: 'C2',
        xp: 9999,
        streak: 365,
        completedLessons: [],
        skills: { speaking: 100, listening: 100, reading: 100, writing: 100 },
        certificates: []
      });
      updated = true;
    }

    if (!hasMarcelo) {
      db.push({
        id: 'teacher-marcelo',
        username: 'teacher marcelo',
        password: '123',
        role: 'teacher',
        level: 'C2',
        xp: 500,
        streak: 10,
        completedLessons: [],
        skills: { speaking: 100, listening: 100, reading: 100, writing: 100 },
        certificates: [],
        email: 'teacher@gmail.com',
        whatsapp: '41999653041'
      });
      updated = true;
    }

    if (updated || !dbStr) {
      localStorage.setItem('lingualeap_db', JSON.stringify(db));
    }
  } catch (e) {
    console.error("Critical error initializing database", e);
    localStorage.removeItem('lingualeap_db'); // Reset if corrupted
  }
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(() => {
    try {
      const saved = localStorage.getItem('lingualeap_current_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    initDB();
  }, []);

  const handleLogin = (user: UserProgress) => {
    setCurrentUser(user);
    localStorage.setItem('lingualeap_current_session', JSON.stringify(user));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lingualeap_current_session');
    navigate('/login');
  };

  const syncUserProgress = (updatedUser: UserProgress) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('lingualeap_current_session', JSON.stringify(updatedUser));
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const updatedDb = db.map((u: UserProgress) => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('lingualeap_db', JSON.stringify(updatedDb));
  };

  if (!currentUser) {
    return <Routes><Route path="*" element={<Login onLogin={handleLogin} />} /></Routes>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={currentUser} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
            <Route path="/lesson/:id" element={<LessonPlayer user={currentUser} onUpdateProgress={syncUserProgress} />} />
            <Route path="/practice/chat" element={<AIConversation user={currentUser} />} />
            <Route path="/modules" element={<Modules user={currentUser} />} />
            {currentUser.role === 'admin' && <Route path="/admin" element={<AdminTab currentUser={currentUser} />} />}
            {(currentUser.role === 'teacher' || currentUser.role === 'admin') && (
              <>
                <Route path="/teacher" element={<TeacherTab currentUser={currentUser} />} />
                <Route path="/notifications" element={<NotificationTab currentUser={currentUser} />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
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
