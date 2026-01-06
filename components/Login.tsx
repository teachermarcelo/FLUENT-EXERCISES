
import React, { useState } from 'react';
import { UserProgress } from '../types';

interface LoginProps {
  onLogin: (user: UserProgress) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    
    // Busca robusta: ignora caixa alta/baixa e espaços extras
    const user = db.find((u: any) => 
      u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
      u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Check your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-[40px] shadow-2xl p-10 space-y-8 animate-fadeIn">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-heading text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Login to your LinguaLeap account</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all"
              placeholder="e.g. admin or teacher marcelo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Sign In
          </button>
        </form>
        
        <div className="pt-4 border-t border-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Initial Access Hints</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 bg-slate-50 rounded-lg text-[9px] text-slate-500">
              Admin: <b>admin</b> / 123
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-[9px] text-slate-500">
              Teacher: <b>teacher marcelo</b> / 123456
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
