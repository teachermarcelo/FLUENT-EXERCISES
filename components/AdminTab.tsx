
import React, { useState, useEffect } from 'react';
import { UserProgress, UserRole, ProficiencyLevel } from '../types.ts';

const AdminTab: React.FC<{ currentUser: UserProgress }> = () => {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserProgress | null>(null);
  const [formData, setFormData] = useState({
    username: '', password: '', role: 'student' as UserRole, level: 'A1' as ProficiencyLevel,
    email: '', whatsapp: '', teacherId: ''
  });

  useEffect(() => {
    refreshDB();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lingualeap_db') refreshDB();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshDB = () => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    setUsers(db);
  };

  const handleSave = (e: React.FormEvent) => {
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
        xp: 0, streak: 0, completedLessons: [], certificates: [],
        skills: { speaking: 10, listening: 10, reading: 10, writing: 10 }
      };
      localStorage.setItem('lingualeap_db', JSON.stringify([...db, newUser]));
    } else if (showForm === 'edit' && editingUser) {
      const updated = db.map((u: UserProgress) => u.id === editingUser.id ? { ...u, ...formData } : u);
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }
    
    window.dispatchEvent(new Event('storage'));
    setShowForm(null);
    refreshDB();
  };

  const deleteUser = (id: string) => {
    if (confirm("REMOVER PERMANENTEMENTE?")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      localStorage.setItem('lingualeap_db', JSON.stringify(db.filter((u: any) => u.id !== id)));
      window.dispatchEvent(new Event('storage'));
      refreshDB();
    }
  };

  const formatTime = (s?: number) => s ? `${Math.floor(s/60)}m` : '0m';

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tighter">Painel de Administração Global</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Base de Dados Unificada - {users.length} Contas Ativas</p>
        </div>
        <button onClick={() => { setShowForm('add'); setFormData({username:'',password:'',role:'student',level:'A1',email:'',whatsapp:'',teacherId:''}); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2">
          Registrar Novo Usuário
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Professor / Hub</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividade</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-black uppercase">{u.username.charAt(0)}</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 uppercase leading-tight">{u.username}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{u.role} | {u.level}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${u.teacherId ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                    {u.teacherId ? users.find(t=>t.id===u.teacherId)?.username.toUpperCase() : (u.role === 'admin' ? 'SYSTEM OVERLORD' : 'CORE ADMIN')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-500">
                    <span>VISTO: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'NUNCA'}</span>
                    <span>ENGAGE: <span className="text-indigo-600">{formatTime(u.totalSessionTime)}</span></span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-100 rounded-lg shadow-sm transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth="2"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative border border-white/20 animate-fadeIn">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter text-slate-900">Configuração Global</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <input required value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} placeholder="NOME COMPLETO" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-600 transition-all uppercase" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value as any})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase">
                  <option value="student">Estudante</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
                <select value={formData.level} onChange={e=>setFormData({...formData, level:e.target.value as any})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold">
                  {['A1','A2','B1','B2','C1','C2'].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <select value={formData.teacherId} onChange={e=>setFormData({...formData, teacherId:e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase">
                <option value="">Sem Professor Atribuído</option>
                {users.filter(u => u.role === 'teacher').map(t => <option key={t.id} value={t.id}>{t.username.toUpperCase()}</option>)}
              </select>
              <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest">Salvar no Banco</button>
              <button type="button" onClick={()=>setShowForm(null)} className="w-full text-slate-400 font-bold text-xs uppercase">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTab;
