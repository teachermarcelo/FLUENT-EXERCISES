
import React, { useState, useEffect } from 'react';
import { UserProgress, UserRole, ProficiencyLevel } from '../types.ts';

const AdminTab: React.FC<{ currentUser: UserProgress }> = () => {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserProgress | null>(null);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '123', 
    role: 'student' as UserRole, 
    level: 'A1' as ProficiencyLevel, 
    email: '', 
    teacherId: '' 
  });

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const refresh = () => setUsers(JSON.parse(localStorage.getItem('lingualeap_db') || '[]'));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    
    if (showForm === 'add') {
      const newUser: UserProgress = { 
        ...formData, 
        id: `user-${Date.now()}`, 
        xp: 0, streak: 0, completedLessons: [], 
        skills: { speaking: 10, listening: 10, reading: 10, writing: 10 }, 
        certificates: [] 
      };
      localStorage.setItem('lingualeap_db', JSON.stringify([...db, newUser]));
    } else if (showForm === 'edit' && editingUser) {
      const updated = db.map((u: any) => u.id === editingUser.id ? { ...u, ...formData } : u);
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }
    
    window.dispatchEvent(new Event('storage'));
    setShowForm(null);
    setEditingUser(null);
  };

  const removeUser = (id: string) => {
    if (confirm("REMOVER USUÁRIO? Esta ação apagará todo o progresso.")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      localStorage.setItem('lingualeap_db', JSON.stringify(db.filter((u: any) => u.id !== id)));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const teachers = users.filter(u => u.role === 'teacher');

  return (
    <div className="space-y-8 animate-fadeIn pt-20 md:pt-0 pb-24 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Admin Control</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Gestão Completa de {users.length} Contas</p>
        </div>
        <button 
          onClick={() => { setShowForm('add'); setFormData({username:'', password:'123', role:'student', level:'A1', email:'', teacherId:''}); }}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all"
        >
          Novo Usuário
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                  u.role === 'admin' ? 'bg-slate-900 text-white' : 
                  u.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm leading-none">{u.username}</h4>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">{u.role} | {u.level}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingUser(u); setFormData({username:u.username, password:u.password||'', role:u.role, level:u.level, email:u.email||'', teacherId:u.teacherId||''}); setShowForm('edit'); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" strokeWidth="2.5"/></svg></button>
                <button onClick={() => removeUser(u.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth="2.5"/></svg></button>
              </div>
            </div>
            
            {u.role === 'student' && (
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Professor Responsável:</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] font-black">
                    {u.teacherId ? users.find(t=>t.id===u.teacherId)?.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {u.teacherId ? users.find(t=>t.id===u.teacherId)?.username.toUpperCase() : 'NENHUM VÍNCULO'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 md:p-14 shadow-2xl animate-fadeIn">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter">Gestão Global</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} placeholder="NOME DO USUÁRIO" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold focus:border-indigo-600 outline-none uppercase text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value as any})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase cursor-pointer text-sm">
                  <option value="student">Estudante</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
                <select value={formData.level} onChange={e=>setFormData({...formData, level:e.target.value as any})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase cursor-pointer text-sm">
                  {['A1','A2','B1','B2','C1','C2'].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Vincular Aluno ao Hub do Professor:</label>
                <select value={formData.teacherId} onChange={e=>setFormData({...formData, teacherId:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase cursor-pointer text-sm">
                  <option value="">Sem Professor Atribuído</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.username.toUpperCase()}</option>)}
                </select>
              </div>

              <button className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-100 mt-4 active:scale-95">
                Confirmar no Banco Master
              </button>
              <button type="button" onClick={()=>{setShowForm(null); setEditingUser(null);}} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest pt-4">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTab;
