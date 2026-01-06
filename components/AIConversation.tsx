
import React, { useState, useRef, useEffect } from 'react';
import { UserProgress } from '../types';
import { generateImmersiveResponse } from '../geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const AIConversation: React.FC<{ user: UserProgress }> = ({ user }) => {
  const [topic, setTopic] = useState<'grammar' | 'travel' | 'general' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const initChat = (selected: 'grammar' | 'travel' | 'general') => {
    setTopic(selected);
    const greetings = {
      grammar: "Welcome! I'm your Grammar Coach. I'll correct your mistakes subtly using asterisks. Ready?",
      travel: "Boarding call! I'm your travel assistant. Where are we heading today?",
      general: "Hello! Let's talk about anything you like. How was your day?"
    };
    setMessages([{ role: 'model', parts: [{ text: greetings[selected] }] }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { role: 'user', parts: [{ text: input.trim() }] };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateImmersiveResponse(history, topic!, user.level);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Immersion Lab is currently offline. Please try again soon." }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center animate-fadeIn">
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-slate-900">IA Immersion Lab</h2>
        <p className="text-slate-500 mb-12 font-medium">Escolha seu ambiente de treinamento focado.</p>
        <div className="grid grid-cols-1 gap-4">
          {['grammar', 'travel', 'general'].map(t => (
            <button key={t} onClick={() => initChat(t as any)} className="p-8 bg-white border-2 border-slate-100 rounded-[32px] hover:border-indigo-600 transition-all text-left flex items-center justify-between group shadow-sm active:scale-95">
              <div>
                <h3 className="text-xl font-black uppercase text-slate-900">{t} Mode</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{t === 'grammar' ? 'Análise de Erros' : t === 'travel' ? 'Simulação de Viagem' : 'Conversa Natural'}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 12h14" strokeWidth="3" strokeLinecap="round"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[90vh] md:h-[85vh] flex flex-col pt-20 md:pt-0 animate-fadeIn">
      <header className="bg-white p-6 md:rounded-[32px] md:mb-4 border-b border-slate-200 md:border-b-8 md:border-indigo-600 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={()=>setTopic(null)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round"/></svg>
          </button>
          <div>
            <h2 className="text-lg font-black uppercase text-slate-900 leading-none">{topic} session</h2>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Nível {user.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA Live</span>
        </div>
      </header>

      <div className="flex-1 bg-white md:rounded-[40px] border border-slate-200 overflow-hidden flex flex-col shadow-inner relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[85%] p-5 rounded-[28px] ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-xl' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{m.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-5 rounded-[28px] rounded-bl-none shadow-sm flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e=>e.key==='Enter'&&handleSend()} 
            placeholder="Type your message..." 
            className="flex-1 p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-sm shadow-inner" 
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-indigo-600 text-white p-5 rounded-2xl shadow-xl disabled:opacity-50 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" strokeWidth="3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConversation;
