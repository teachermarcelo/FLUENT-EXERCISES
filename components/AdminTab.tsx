
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

  const OFFICIAL_SENDER = "41998778348";

  useEffect(() => {
    refreshDB();
  }, []);

  const refreshDB = () => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    setUsers(db);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'student',
      level: 'A1',
      email: '',
      whatsapp: '',
      teacherId: ''
    });
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
      const updated = db.map((u: UserProgress) => 
        u.id === editingUser.id ? { ...u, ...formData } : u
      );
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }
    
    refreshDB();
    resetForm();
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Remove this user permanently?")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      const updated = db.filter((u: UserProgress) => u.id !== id);
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
      refreshDB();
    }
  };

  const startEdit = (user: UserProgress) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password || '',
      role: user.role,
      level: user.level,
      email: user.email || '',
      whatsapp: user.whatsapp || '',
      teacherId: user.teacherId || ''
    });
    setShowForm('edit');
  };

  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin');

  const getTeacherName = (id?: string) => {
    if (!id) return "Unassigned";
    const teacher = users.find(u => u.id === id);
    return teacher ? teacher.username : "Unknown";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900">Admin Control</h2>
          <p className="text-slate-500 text-sm">Managing platform users and teacher assignments.</p>
        </div>
        <button 
          onClick={() => setShowForm('add')}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          New User Account
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-fadeIn border border-slate-100">
            <button onClick={resetForm} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold mb-8 font-heading text-slate-900">{showForm === 'add' ? 'Add User' : 'Edit User'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                  <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 transition-all" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 transition-all" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 transition-all">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Level</label>
                  <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as ProficiencyLevel})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 transition-all">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Teacher</label>
                  <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 transition-all">
                    <option value="">No Teacher Assigned</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="554199..." className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-indigo-600 transition-all" />
              </div>

              <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4">
                {showForm === 'add' ? 'Create Account' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher Hub</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {user.username.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{user.username}</span>
                        <span className="text-[9px] text-indigo-500 font-black tracking-tighter uppercase">{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-0.5 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>{user.email || 'N/A'}</span>
                      <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.06L0 24l6.12-1.605a11.847 11.847 0 005.928 1.603h.005c6.637 0 12.033-5.396 12.036-12.03.001-3.218-1.248-6.242-3.517-8.511z"/></svg>{user.whatsapp || 'N/A'}</span>
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
                      <span className="text-sm font-bold text-slate-700">{user.level}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {user.role === 'student' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                          {getTeacherName(user.teacherId)}
                        </span>
                        <button onClick={() => startEdit(user)} className="text-[10px] text-indigo-600 font-bold hover:underline">Change</button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest italic">Host User</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTab;
