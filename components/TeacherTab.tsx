
import React, { useState, useEffect } from 'react';
import { UserProgress, ProficiencyLevel } from '../types';

const TeacherTab: React.FC<{ currentUser: UserProgress }> = ({ currentUser }) => {
  const [myStudents, setMyStudents] = useState<UserProgress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    level: 'A1' as ProficiencyLevel,
    email: '',
    whatsapp: ''
  });

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const refreshData = () => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const students = db.filter((u: UserProgress) => 
      u.role === 'student' && u.teacherId === currentUser.id
    );
    setMyStudents(students);
  };

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) return;

    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const newStudent: UserProgress = {
      id: `std-${Date.now()}`,
      username: formData.username.trim(),
      password: formData.password || '123456',
      role: 'student',
      level: formData.level,
      email: formData.email,
      whatsapp: formData.whatsapp,
      teacherId: currentUser.id,
      xp: 0,
      streak: 0,
      completedLessons: [],
      skills: { speaking: 0, listening: 0, reading: 0, writing: 0 },
      certificates: [],
    };

    localStorage.setItem('lingualeap_db', JSON.stringify([...db, newStudent]));
    setFormData({ username: '', password: '', level: 'A1', email: '', whatsapp: '' });
    setShowAddModal(false);
    refreshData();
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0m";
    const mins = Math.floor(seconds / 60);
    return mins > 0 ? `${mins}m` : `${seconds}s`;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900 uppercase">Teacher Hub</h2>
          <p className="text-slate-500 font-medium">Tracking {myStudents.length} active students in your learning circle.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          Add New Student
        </button>
      </header>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-12 shadow-2xl relative animate-fadeIn">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round"/></svg>
            </button>
            <h3 className="text-2xl font-bold mb-8 uppercase tracking-tight">Student Enrollment</h3>
            <form onSubmit={handleRegisterStudent} className="space-y-5">
              <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="STUDENT FULL NAME" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase tracking-tight outline-none focus:border-indigo-600" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as ProficiencyLevel})} className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="PWD (DEFAULT 123456)" className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
              </div>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="EMAIL ADDRESS" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
              <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="WHATSAPP (+55...)" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" />
              <button className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-100">Confirm Registration</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myStudents.map(student => (
          <div key={student.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-2xl font-black">
                {student.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-900 text-xl leading-tight uppercase group-hover:text-indigo-600 transition-colors">{student.username}</h3>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mastery: {student.level}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">XP Points</p>
                  <p className="text-xl font-black text-slate-900">{student.xp}</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stay Duration</p>
                  <p className="text-xl font-black text-indigo-600">{formatTime(student.totalSessionTime)}</p>
               </div>
            </div>

            <div className="space-y-3 flex-1 mb-6">
               <div className="flex items-center justify-between text-xs font-bold">
                 <span className="text-slate-400 uppercase tracking-tighter">Last Login</span>
                 <span className="text-slate-900">{student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never'}</span>
               </div>
               <div className="flex items-center justify-between text-xs font-bold">
                 <span className="text-slate-400 uppercase tracking-tighter">Status</span>
                 <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    ACTIVE
                 </span>
               </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
               {Object.entries(student.skills).map(([skill, val]) => (
                 <div key={skill} className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${val}%` }}></div>
                 </div>
               ))}
            </div>
            
            <button className="mt-6 w-full py-4 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              View Detailed Portfolio
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherTab;
