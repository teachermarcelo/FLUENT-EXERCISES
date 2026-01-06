
import React, { useState, useEffect } from 'react';
import { UserProgress, ProficiencyLevel } from '../types.ts';
import { generatePedagogicalReport } from '../geminiService.ts';

const TeacherTab: React.FC<{ currentUser: UserProgress }> = ({ currentUser }) => {
  const [students, setStudents] = useState<UserProgress[]>([]);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, string[]>>({});
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null);
  const [editingStudent, setEditingStudent] = useState<UserProgress | null>(null);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '123', 
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
    // PRIVACIDADE: Professores só veem alunos vinculados ao seu teacherId. Admin vê tudo.
    const myStudents = db.filter((u: UserProgress) => 
      u.role === 'student' && (u.teacherId === currentUser.id || currentUser.role === 'admin')
    );
    setStudents(myStudents);
  };

  const handleGenerateReport = async (s: UserProgress) => {
    if (loadingReport) return;
    setLoadingReport(s.id);
    try {
      const tips = await generatePedagogicalReport(s);
      setReports(prev => ({ ...prev, [s.id]: tips }));
    } catch (e) {
      alert("Erro ao gerar relatório com IA. Tente novamente.");
    } finally {
      setLoadingReport(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    
    if (showForm === 'add') {
      const newUser: UserProgress = {
        ...formData,
        id: `std-${Date.now()}`,
        role: 'student',
        teacherId: currentUser.id,
        xp: 0,
        streak: 0,
        completedLessons: [],
        certificates: [],
        skills: { speaking: 10, listening: 10, reading: 10, writing: 10 }
      };
      localStorage.setItem('lingualeap_db', JSON.stringify([...db, newUser]));
    } else {
      const updated = db.map((u: UserProgress) => 
        u.id === editingStudent?.id ? { ...u, ...formData } : u
      );
      localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    }

    window.dispatchEvent(new Event('storage'));
    setShowForm(null);
    setEditingStudent(null);
  };

  const resetPassword = (id: string) => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const updated = db.map((u: any) => u.id === id ? { ...u, password: '123' } : u);
    localStorage.setItem('lingualeap_db', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    alert("Senha restaurada para: 123");
  };

  const deleteStudent = (id: string) => {
    if (confirm("Remover este aluno? Os dados de progresso serão perdidos.")) {
      const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
      localStorage.setItem('lingualeap_db', JSON.stringify(db.filter((u: any) => u.id !== id)));
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pt-20 md:pt-0 pb-24 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Meus Alunos</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Hub Pedagógico - {students.length} Estudantes</p>
        </div>
        <button 
          onClick={() => { setShowForm('add'); setFormData({username:'', password:'123', level:'A1', email:'', whatsapp:''}); }}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/></svg>
          Registrar Aluno
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {students.map(s => (
          <div key={s.id} className="bg-white rounded-[40px] border border-slate-200 p-8 hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              {/* Informações Principais */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 text-3xl font-black uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {s.username.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{s.username}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{s.level}</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase">{s.xp} XP</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold lowercase flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2"/></svg>
                    {s.email || 'Não cadastrado'}
                  </p>
                </div>
              </div>

              {/* Skills Progress */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto flex-1 max-w-xl">
                {Object.entries(s.skills).map(([skill, val]) => (
                  <div key={skill} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{skill}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-700">{val}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Menu de Ações */}
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => handleGenerateReport(s)} 
                  className="flex-1 lg:flex-none px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 flex items-center justify-center gap-3 transition-all"
                >
                  {loadingReport === s.id ? <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"/> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>}
                  Gerar Report IA
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => { setEditingStudent(s); setFormData({username:s.username, password:s.password||'123', level:s.level, email:s.email||'', whatsapp:s.whatsapp||''}); setShowForm('edit'); }}
                    className="flex-1 sm:flex-none p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" strokeWidth="2.5"/></svg>
                  </button>
                  <button onClick={() => resetPassword(s.id)} className="flex-1 sm:flex-none p-4 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-2xl transition-all" title="Reset Senha">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeWidth="2.5"/></svg>
                  </button>
                  <button onClick={() => deleteStudent(s.id)} className="flex-1 sm:flex-none p-4 bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth="2.5"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Relatório Pedagógico IA */}
            {reports[s.id] && (
              <div className="mt-10 pt-10 border-t border-slate-100 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs">AI</div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Plano de Evolução (IA Diagnostics)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports[s.id].map((tip, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex items-start gap-4 hover:border-indigo-200 transition-all">
                      <span className="w-6 h-6 bg-white border border-slate-200 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm">{idx+1}</span>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Unificado de Cadastro/Edição */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 md:p-14 shadow-2xl animate-fadeIn relative">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter text-slate-900">{showForm === 'add' ? 'Novo Aluno' : 'Perfil do Aluno'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nome Completo</label>
                <input required value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} placeholder="Ex: João da Silva" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold focus:border-indigo-600 outline-none uppercase text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">E-mail Acadêmico</label>
                <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} placeholder="aluno@exemplo.com" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold focus:border-indigo-600 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nível CEFR</label>
                  <select value={formData.level} onChange={e=>setFormData({...formData, level:e.target.value as any})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold uppercase text-sm">
                    {['A1','A2','B1','B2','C1','C2'].map(l=><option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Senha Provisória</label>
                  <input value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} placeholder="Padrão 123" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold focus:border-indigo-600 outline-none text-sm" />
                </div>
              </div>
              <button className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-100 mt-6 active:scale-95 transition-all">Salvar Dados</button>
              <button type="button" onClick={()=>{setShowForm(null); setEditingStudent(null);}} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest pt-4">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTab;
