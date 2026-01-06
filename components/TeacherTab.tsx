
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
    // Filtro rigoroso: Apenas alunos vinculados a ESTE professor
    const students = db.filter((u: UserProgress) => 
      u.role === 'student' && u.teacherId === currentUser.id
    );
    setMyStudents(students);
  };

  const generateTrackingPoints = (s: UserProgress) => {
    const p = [];
    if (s.skills.speaking < 40) p.push("Melhorar articulação de fonemas (Speaking)");
    if (s.skills.listening < 50) p.push("Focar em escuta ativa nível " + s.level);
    if (s.xp < 200) p.push("Engajamento: Iniciar novos módulos básicos");
    if (s.streak === 0) p.push("Consistência: Sugerir prática diária curta");
    if (s.skills.writing < 30) p.push("Reforçar estrutura gramatical básica");
    return p.slice(0, 5);
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
        teacherId: currentUser.id, 
        xp: 0, 
        streak: 0, 
        completedLessons: [], 
        certificates: [],
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
    if (confirm("Remover aluno permanentemente? Esta ação não pode ser desfeita.")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      localStorage.setItem('lingualeap_db', JSON.stringify(db.filter((u: any) => u.id !== id)));
      window.dispatchEvent(new Event('storage'));
      refreshData();
    }
  };

  const resetPwd = (id: string) => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    localStorage.setItem('lingualeap_db', JSON.stringify(db.map((u: any) => u.id === id ? {...u, password: '123'} : u)));
    window.dispatchEvent(new Event('storage'));
    alert("Senha resetada para 123");
  };

  const formatTime = (s?: number) => s ? `${Math.floor(s/60)}m` : '0m';

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black font-heading text-slate-900 uppercase tracking-tighter">Gestão de Alunos</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Alunos em seu círculo exclusivo: {myStudents.length}</p>
        </div>
        <button 
          onClick={() => { 
            setShowForm('add'); 
            setFormData({username:'', password:'', level:'A1', email:'', whatsapp:''}); 
          }} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
          Registrar Novo Aluno
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status & Sessão</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Pedagógico (5 Pontos)</th>
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
                      <span className="text-[9px] text-indigo-500 font-black tracking-widest uppercase">{s.level} | {s.xp} XP</span>
                      {s.email && <span className="text-[8px] text-slate-400 font-medium lowercase">{s.email}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-500">
                    <span>Último Login: {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : 'Nunca'}</span>
                    <span>Permanência: <span className="text-indigo-600">{formatTime(s.totalSessionTime)}</span></span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    {generateTrackingPoints(s).map((p, i) => (
                      <div key={i} className="text-[9px] font-bold text-slate-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-indigo-400 rounded-full"></span> {p}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>{setEditingUser(s); setFormData({username:s.username, password:s.password||'', level:s.level, email:s.email||'', whatsapp:s.whatsapp||''}); setShowForm('edit');}} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-100 rounded-lg shadow-sm transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2"/></svg></button>
                    <button onClick={()=>resetPwd(s.id)} title="Reset para 123" className="p-2 text-slate-400 hover:text-amber-600 bg-white border border-slate-100 rounded-lg shadow-sm transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"/></svg></button>
                    <button onClick={()=>deleteStudent(s.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-100 rounded-lg shadow-sm transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2"/></svg></button>
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
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter text-slate-900">Perfil do Aluno</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                <input required value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} placeholder="NOME DO ALUNO" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-600 transition-all uppercase" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail de Contato</label>
                <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} placeholder="email@exemplo.com" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-600 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nível Inicial</label>
                  <select value={formData.level} onChange={e=>setFormData({...formData, level:e.target.value as any})} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase cursor-pointer">
                    {['A1','A2','B1','B2','C1','C2'].map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Senha de Acesso</label>
                  <input value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} placeholder="PADRÃO: 123" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-600 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp (Opcional)</label>
                <input value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp:e.target.value})} placeholder="+55419..." className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-600 transition-all" />
              </div>

              <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Confirmar Registro</button>
              <button type="button" onClick={()=>setShowForm(null)} className="w-full text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTab;
