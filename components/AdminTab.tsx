
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
        password: formData.password || '123',
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
      localStorage.setItem('lingualeap_db', JSON.stringify([...db, newUser]));
    } else if (showForm === 'edit' && editingUser) {
      const updated = db.map((u: UserProgress) => u.id === editingUser.id ? { ...u, ...formData } : u);
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }
    
    refreshDB();
    resetForm();
  };

  const deleteUser = (id: string) => {
    if (window.confirm("Are you sure? This action is permanent.")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      const filtered = db.filter((u: UserProgress) => u.id !== id);
      localStorage.setItem('lingualeap_db', JSON.stringify(filtered));
      refreshDB();
    }
  };

  const resetPassword = (id: string) => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const updated = db.map((u: UserProgress) => u.id === id ? { ...u, password: '123456' } : u);
    localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    alert("Password reset to 123456");
    refreshDB();
  };

  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin');

  const getTeacherName = (id?: string) => {
    if (!id) return "Unassigned";
    const t = users.find(u => u.id === id);
    return t ? t.username : "N/A";
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900">Admin Control</h2>
          <p className="text-slate-500 text-sm">Overview of all system users and teacher assignments.</p>
        </div>
        <button onClick={() => setShowForm('add')} className="bg-indigo-600 text-white px-8 py-4 rounded-[20px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
          Register User
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-fadeIn border border-slate-100">
             <button onClick={resetForm} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <h3 className="text-2xl font-bold mb-8 font-heading text-slate-900 uppercase tracking-tight">
               {showForm === 'add' ? 'Create New Account' : 'Edit User Settings'}
             </h3>
             <form onSubmit={handleSaveUser} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. John Doe" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Level</label>
                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as ProficiencyLevel})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                    <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600" />
                  </div>
                </div>

                {formData.role === 'student' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Teacher Hub</label>
                    <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600">
                      <option value="">No Teacher (Self-Managed)</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.username.toUpperCase()}</option>)}
                    </select>
                  </div>
                )}

                <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-100 active:scale-95 transition-transform mt-4">
                  Confirm Data
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access & Level</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher Assignment</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-lg uppercase leading-tight">{user.username}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {user.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                       user.role === 'admin' ? 'bg-red-50 text-red-600' : 
                       user.role === 'teacher' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                     }`}>
                       {user.role}
                     </span>
                     <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                       {user.level}
                     </span>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 w-fit">
                      {getTeacherName(user.teacherId)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingUser(user); setFormData({...formData, username: user.username, role: user.role, level: user.level, teacherId: user.teacherId || '', email: user.email || '', whatsapp: user.whatsapp || ''}); setShowForm('edit'); }}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button 
                      onClick={() => resetPassword(user.id)}
                      title="Reset Password to 123456"
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-amber-600 hover:border-amber-100 shadow-sm transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 shadow-sm transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
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
