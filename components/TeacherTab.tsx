
import React, { useState, useEffect } from 'react';
import { UserProgress, ProficiencyLevel } from '../types.ts';

const TeacherTab: React.FC<{ currentUser: UserProgress }> = ({ currentUser }) => {
  const [myStudents, setMyStudents] = useState<UserProgress[]>([]);
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<UserProgress | null>(null);
  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    level: 'A1' as ProficiencyLevel,
    email: '', 
    whatsapp: ''
  });

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, [currentUser]);

  const refreshData = () => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    // FILTRO DE PRIVACIDADE: Só mostra alunos que têm teacherId igual ao ID do professor logado
    const students = db.filter((u: UserProgress) => 
      u.role === 'student' && u.teacherId === currentUser.id
    );
    setMyStudents(students);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    
    if (showForm === 'add') {
      const newUser: UserProgress = {
        id: `std-${Date.now()}`,
        username: formData.username,
        password: formData.password || '123',
        role: 'student', 
        level: formData.level,
        email: formData.email, 
        whatsapp: formData.whatsapp,
        teacherId: currentUser.id, // Vincula AUTOMATICAMENTE a este professor
        xp: 0, streak: 0, completedLessons: [], certificates: [],
        skills: { speaking: 10, listening: 10, reading: 10, writing: 10 }
      };
      localStorage.setItem('lingualeap_db', JSON.stringify([...db, newUser]));
    } else if (showForm === 'edit' && editingUser) {
      const updated = db.map((u: UserProgress) => 
        u.id === editingUser.id ? { ...u, ...formData } : u
      );
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }
    
    window.dispatchEvent(new Event('storage'));
    setShowForm(null);
    refreshData();
  };

  const deleteStudent = (id: string) => {
    if (confirm("Remover aluno do seu círculo?")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      localStorage.setItem('lingualeap_db', JSON.stringify(db.filter((u: any) => u.id !== id)));
      window.dispatchEvent(new Event('storage'));
      refreshData();
    }
  };

  const formatTime = (s?: number) => s ? `${Math.floor(s/60)}m` : '0m';

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tighter">Aba ALUNOS</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Sincronizado com: Professor {currentUser.username.toUpperCase()}</p>
        </div>
        <button 
          onClick={() => { setShowForm('add'); setFormData({username:'', password:'', level:'A1', email:'', whatsapp:''}); }} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2"
        >
          Registrar Novo Aluno
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / XP</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contatos</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myStudents.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-black uppercase">{s.username.charAt(0)}</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 uppercase leading-tight">{s.username}</span>
                      <span className="text-[9px] text-indigo-500 font-black tracking-widest uppercase">Nível {s.level}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-500">
                    <span>PROGRESSO: <span className="text-indigo-600">{s.xp} XP</span></span>
                    <span>SESSÃO: {formatTime(s.totalSessionTime)}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col text-[10px] font-bold text-slate-400">
                    <span className="lowercase">{s.email || 'sem e-mail'}</span>
                    <span>{s.whatsapp || 'sem whatsapp'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>{setEditingUser(s); setFormData({username:s.username, password:s.password||'', level:s.level, email:s.email||'', whatsapp:s.whatsapp||''}); setShowForm('edit');}} className="p-2 text-slate-400 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" strokeWidth="2"/></svg></button>
                    <button onClick={()=>deleteStudent(s.id)} className="p-2 text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth="2"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-fadeIn">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter text-slate-900">Novo Registro Aluno</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} placeholder="NOME DO ALUNO" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none uppercase" />
              <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} placeholder="E-MAIL (OBRIGATÓRIO)" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.level} onChange={e=>setFormData({...formData, level:e.target.value as any})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase">
                  {['A1','A2','B1','B2','C1','C2'].map(l=><option key={l} value={l}>{l}</option>)}
                </select>
                <input value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} placeholder="SENHA (PADRÃO 123)" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold" />
              </div>
              <input value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp:e.target.value})} placeholder="WHATSAPP (OPCIONAL)" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none" />
              <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest">Vincular a Meu Hub</button>
              <button type="button" onClick={()=>setShowForm(null)} className="w-full text-slate-400 font-bold text-xs uppercase">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTab;
