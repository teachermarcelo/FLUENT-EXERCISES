
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DiagnosticTest from './components/DiagnosticTest';
import LessonPlayer from './components/LessonPlayer';
import AIConversation from './components/AIConversation';
import LevelSelector from './components/LevelSelector';
import Modules from './components/Modules';
import AdminTab from './components/AdminTab';
import TeacherTab from './components/TeacherTab';
import NotificationTab from './components/NotificationTab';
import Login from './components/Login';
import { UserProgress, ProficiencyLevel } from './types';

const initDB = () => {
  const dbStr = localStorage.getItem('lingualeap_db');
  let db: UserProgress[] = dbStr ? JSON.parse(dbStr) : [];
  
  const hasAdmin = db.some(u => u.username.toLowerCase() === 'admin');
  const hasMarcelo = db.some(u => u.username.toLowerCase() === 'teacher marcelo');
  const hasGestor = db.some(u => u.username.toLowerCase() === 'gestor paid');

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
      password: '123456',
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

  if (!hasGestor) {
    db.push({
      id: 'student-gestor',
      username: 'gestor paid',
      password: '123456',
      role: 'student',
      level: 'A1',
      xp: 0,
      streak: 0,
      completedLessons: [],
      skills: { speaking: 0, listening: 0, reading: 0, writing: 0 },
      certificates: [],
      email: 'gestorpaid@gmail.com',
      whatsapp: '41999653041'
    });
    updated = true;
  }

  if (updated || !dbStr) {
    localStorage.setItem('lingualeap_db', JSON.stringify(db));
  }
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(() => {
    const saved = localStorage.getItem('lingualeap_current_session');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    initDB();
  }, []);

  const handleLogin = (user: UserProgress) => {
    setCurrentUser(user);
    localStorage.setItem('lingualeap_current_session', JSON.stringify(user));
    
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const updatedDb = db.map((u: UserProgress) => 
      u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    localStorage.setItem('lingualeap_db', JSON.stringify(updatedDb));
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
            
            {currentUser.role === 'admin' && (
              <Route path="/admin" element={<AdminTab currentUser={currentUser} />} />
            )}
            
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
