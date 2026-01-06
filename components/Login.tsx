
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
    const user = db.find((u: any) => u.username === username && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. (Hint: admin/123)');
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
              placeholder="Enter username"
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

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
