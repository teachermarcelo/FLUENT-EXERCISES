
import React, { useState, useEffect } from 'react';
import { UserProgress } from '../types';

interface LoginProps {
  onLogin: (user: UserProgress) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const exists = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(exists);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const user = db.find((u: any) => 
      u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
      u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Acesso negado. Verifique usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
         <svg className="w-96 h-96 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14H11V21L20 10H13Z"/></svg>
      </div>

      <div className="bg-white max-w-md w-full rounded-[48px] shadow-2xl p-12 space-y-10 animate-fadeIn z-10 border-b-8 border-indigo-600">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-200">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black font-heading text-slate-900 uppercase tracking-tighter leading-none">FLUENT<br/>IMMERSION</h1>
          <p className="text-slate-400 mt-3 font-bold uppercase text-[10px] tracking-widest">Global Master Academy</p>
        </div>

        {!hasKey && (
          <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl space-y-4">
            <p className="text-xs font-bold text-amber-800 text-center uppercase tracking-widest">Configuração Necessária</p>
            <p className="text-[10px] text-amber-600 text-center font-medium leading-relaxed">Para habilitar o Professor IA (Gemini 3), você precisa selecionar sua chave de API do Google Cloud.</p>
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
            >
              Configurar Chave de API
            </button>
            <p className="text-[8px] text-center text-amber-400">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Documentação de Faturamento</a>
            </p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className={`space-y-4 ${!hasKey ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username / Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700"
              placeholder="e.g. admin"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black text-center border border-red-100 uppercase tracking-widest">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-sm tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
          >
            Access Portal
          </button>
        </form>
        
        <div className="pt-6 border-t border-slate-50 text-center">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-3 bg-slate-50 rounded-xl text-[9px] text-slate-500 font-bold border border-slate-100">
              Admin: <span className="text-indigo-600">admin / 123</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-[9px] text-slate-500 font-bold border border-slate-100">
              Teacher: <span className="text-indigo-600">marcelo / 123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
