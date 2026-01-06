
import React, { useState, useEffect } from 'react';
import { UserProgress, UserRole, ProficiencyLevel } from '../types';

const AdminTab: React.FC<{ currentUser: UserProgress }> = () => {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserProgress | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student' as UserRole,
    level: 'A1' as ProficiencyLevel,
    email: '',
    whatsapp: '',
    teacherId: ''
  });

  useEffect(() => {
    refreshDB();
  }, []);

  const refreshDB = () => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    setUsers(db);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'student', level: 'A1', email: '', whatsapp: '', teacherId: '' });
    setEditingUser(null);
    setShowForm(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    
    if (showForm === 'add') {
      const newUser: UserProgress = {
        id: `user-${Date.now()}`,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        level: formData.level,
        email: formData.email,
        whatsapp: formData.whatsapp,
        teacherId: formData.teacherId || undefined,
        xp: 0,
        streak: 0,
        completedLessons: [],
        skills: { speaking: 0, listening: 0, reading: 0, writing: 0 },
        certificates: [],
      };
      const updated = [...db, newUser];
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    } else if (showForm === 'edit' && editingUser) {
      const updated = db.map((u: UserProgress) => u.id === editingUser.id ? { ...u, ...formData } : u);
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }
    
    refreshDB();
    resetForm();
  };

  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin');

  const getTeacherName = (id?: string) => {
    if (!id) return "None (Self-Enroll)";
    const t = users.find(u => u.id === id);
    return t ? t.username : "Unknown Hub";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900">Admin Control</h2>
          <p className="text-slate-500 text-sm">Overview of all platform users and teacher hubs.</p>
        </div>
        <button onClick={() => setShowForm('add')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          Create User
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-fadeIn">
             <button onClick={resetForm} className="absolute top-8 right-8 text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
             <h3 className="text-2xl font-bold mb-6 font-heading">{showForm === 'add' ? 'Add Account' : 'Edit Account'}</h3>
             <form onSubmit={handleSaveUser} className="space-y-4">
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Username" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as ProficiencyLevel})} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                {formData.role === 'student' && (
                  <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <option value="">No Teacher Hub</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                  </select>
                )}
                <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">Save Account</button>
             </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher Hub</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">{user.username.charAt(0).toUpperCase()}</div>
                    <div className="flex flex-col"><span className="font-bold text-slate-900">{user.username}</span><span className="text-[9px] text-indigo-500 font-black tracking-tighter uppercase">{user.id}</span></div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-red-50 text-red-600' : user.role === 'teacher' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>{user.role}</span>
                   <span className="ml-2 text-sm font-bold text-slate-700">{user.level}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{getTeacherName(user.teacherId)}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => { setEditingUser(user); setFormData({...formData, username: user.username, role: user.role, level: user.level, teacherId: user.teacherId || ''}); setShowForm('edit'); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTab;
