
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
    // O professor vê apenas alunos onde o teacherId corresponde ao seu ID
    const students = db.filter((u: UserProgress) => 
      u.role === 'student' && u.teacherId === currentUser.id
    );
    setMyStudents(students);
  };

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    
    const newStudent: UserProgress = {
      id: `std-${Date.now()}`,
      username: formData.username.trim(),
      password: formData.password,
      role: 'student',
      level: formData.level,
      email: formData.email,
      whatsapp: formData.whatsapp,
      teacherId: currentUser.id, // Vínculo automático
      xp: 0,
      streak: 0,
      completedLessons: [],
      skills: { speaking: 0, listening: 0, reading: 0, writing: 0 },
      certificates: [],
    };

    const updated = [...db, newStudent];
    localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    
    setFormData({ username: '', password: '', level: 'A1', email: '', whatsapp: '' });
    setShowAddModal(false);
    refreshData();
  };

  const getAIInsights = (skills: UserProgress['skills']) => {
    const insights = [];
    if (skills.speaking < 40) insights.push("Focus on Phonetic Accuracy");
    if (skills.listening < 40) insights.push("Needs immersive Audio context");
    if (skills.writing < 50) insights.push("Review Syntax & Grammar rules");
    if (skills.reading < 50) insights.push("Expand vocabulary range");
    
    return insights.length > 0 ? insights : ["Stable performance detected."];
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900">Teacher Hub</h2>
          <p className="text-slate-500">Monitoring {myStudents.length} students assigned to you.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Register Student
        </button>
      </header>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-fadeIn">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold mb-6 font-heading">Register Student</h3>
            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</label>
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proficiency</label>
                  <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as ProficiencyLevel})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Number</label>
                <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600" placeholder="554199..." />
              </div>
              <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4">
                Enroll Student
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myStudents.map(student => {
          const insights = getAIInsights(student.skills);
          const skillEntries = Object.entries(student.skills) as [string, number][];
          
          return (
            <div key={student.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-md transition-all group border-b-4 border-b-indigo-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                  {student.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{student.username}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 uppercase font-black">Level {student.level}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] text-indigo-500 font-bold uppercase">{student.xp} Total XP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {skillEntries.map(([skill, val]) => (
                    <div key={skill} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">{skill}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-800">{val}%</p>
                        <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden">
                           <div className={`h-full ${val > 70 ? 'bg-emerald-500' : val > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${val}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-indigo-600 rounded-md text-white">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Skills Tracking Insight</span>
                  </div>
                  <ul className="space-y-2">
                    {insights.map((ins, i) => (
                      <li key={i} className="text-[11px] font-bold text-slate-700 flex items-start gap-2 leading-tight">
                        <span className="mt-1 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0"></span>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Status</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {myStudents.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[40px] border-4 border-dashed border-slate-100">
          <p className="text-slate-400 font-bold text-lg">No students found in your hub.</p>
          <button onClick={() => setShowAddModal(true)} className="mt-2 text-indigo-600 font-bold hover:underline">Register your first student now</button>
        </div>
      )}
    </div>
  );
};

export default TeacherTab;
