
import React, { useState, useEffect } from 'react';
import { UserProgress } from '../types';

interface NotificationTabProps {
  currentUser: UserProgress;
}

const NotificationTab: React.FC<NotificationTabProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  const OFFICIAL_SENDER = "41998778348";

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    // Se for teacher, só pode notificar seus alunos. Se for admin, todos.
    const filtered = db.filter((u: UserProgress) => 
      currentUser.role === 'admin' || u.teacherId === currentUser.id
    );
    setUsers(filtered);
  }, [currentUser]);

  const handleSend = () => {
    if (!message.trim()) {
      alert("Por favor, digite uma mensagem.");
      return;
    }

    const targets = selectedTarget === 'all' 
      ? users.filter(u => u.role === 'student') 
      : users.filter(u => u.id === selectedTarget);

    if (targets.length === 0) {
      alert("Nenhum destinatário encontrado com informações de contato.");
      return;
    }

    targets.forEach(target => {
      if (channel === 'whatsapp' && target.whatsapp) {
        const text = encodeURIComponent(`*LinguaLeap - Mensagem de ${currentUser.username.toUpperCase()}*\n\n${message}`);
        window.open(`https://wa.me/${target.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
      } else if (channel === 'email' && target.email) {
        const subject = encodeURIComponent("Atualização LinguaLeap Learning");
        const body = encodeURIComponent(`${message}\n\nAtenciosamente,\nEquipe LinguaLeap`);
        window.open(`mailto:${target.email}?subject=${subject}&body=${body}`, '_blank');
      }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold font-heading text-slate-900">Notifications Center</h2>
        <p className="text-slate-500 mt-1">
          Sender oficial: <span className="font-bold text-indigo-600">+{OFFICIAL_SENDER}</span>
        </p>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 max-w-2xl border-b-8 border-b-indigo-600">
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Recipient</label>
            <select 
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-[24px] border-2 border-slate-100 outline-none focus:border-indigo-600 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
            >
              <option value="all">🚀 All My Students</option>
              {users.filter(u => u.role === 'student').map(u => (
                <option key={u.id} value={u.id}>👤 {u.username} ({u.whatsapp || u.email || 'No contact'})</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Communication Channel</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setChannel('whatsapp')}
                className={`p-5 rounded-[24px] border-2 flex items-center justify-center gap-3 transition-all font-bold ${
                  channel === 'whatsapp' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.06L0 24l6.12-1.605a11.847 11.847 0 005.928 1.603h.005c6.637 0 12.033-5.396 12.036-12.03.001-3.218-1.248-6.242-3.517-8.511z" /></svg>
                WhatsApp
              </button>
              <button 
                onClick={() => setChannel('email')}
                className={`p-5 rounded-[24px] border-2 flex items-center justify-center gap-3 transition-all font-bold ${
                  channel === 'email' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Message Content</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem oficial aqui..."
              className="w-full p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100 outline-none focus:border-indigo-600 h-48 resize-none font-medium text-slate-700 transition-all shadow-inner"
            />
          </div>

          <button 
            onClick={handleSend}
            className={`w-full py-6 rounded-[24px] font-black text-lg text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
              channel === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            <span>Confirm & Send Message</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationTab;
