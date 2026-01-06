
import React, { useState, useEffect } from 'react';
import { UserProgress, UserRole, ProficiencyLevel } from '../types';

const AdminTab: React.FC<{ currentUser: UserProgress }> = () => {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newLevel, setNewLevel] = useState<ProficiencyLevel>('A1');

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    setUsers(db);
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProgress = {
      id: `user-${Date.now()}`,
      username: newName,
      password: newPass,
      role: newRole,
      level: newLevel,
      xp: 0,
      streak: 0,
      completedLessons: [],
      skills: { speaking: 0, listening: 0, reading: 0, writing: 0 },
      certificates: [],
      lastLogin: undefined
    };

    const updatedDb = [...users, newUser];
    localStorage.setItem('lingualeap_db', JSON.stringify(updatedDb));
    setUsers(updatedDb);
    setShowAddForm(false);
    setNewName('');
    setNewPass('');
  };

  const handleLinkToTeacher = (studentId: string, teacherId: string) => {
    const updatedDb = users.map(u => u.id === studentId ? { ...u, teacherId } : u);
    localStorage.setItem('lingualeap_db', JSON.stringify(updatedDb));
    setUsers(updatedDb);
  };

  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin');

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-heading text-slate-900">Admin Control</h2>
          <p className="text-slate-500">Manage users, teachers and platform access.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Register New User
        </button>
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 text-slate-400">✕</button>
            <h3 className="text-2xl font-bold mb-6">Create Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Username" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" required />
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" required />
              <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
              </select>
              <select value={newLevel} onChange={e => setNewLevel(e.target.value as ProficiencyLevel)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none">
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Save User</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Level</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Assignment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-600">{user.level}</td>
                <td className="px-6 py-4">
                  {user.role === 'student' ? (
                    <select 
                      value={user.teacherId || ''} 
                      onChange={e => handleLinkToTeacher(user.id, e.target.value)}
                      className="text-xs p-1 border rounded-lg outline-none"
                    >
                      <option value="">No Teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                    </select>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTab;
