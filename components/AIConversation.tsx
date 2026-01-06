
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
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const initChat = (selected: 'grammar' | 'travel' | 'general') => {
    setTopic(selected);
    const greetings = {
      grammar: "Welcome! I'm your Grammar Coach. I'll correct your mistakes subtly using the sandwich method. Ready to start?",
      travel: "Boarding call! I'm your travel assistant. Where are we heading today? Any specific destination in mind?",
      general: "Hello! Let's talk about anything you like. How was your day? Did you learn anything new today?"
    };
    setMessages([{ role: 'model', parts: [{ text: greetings[selected] }] }]);
  };

  const handleSend = async (manualText?: string) => {
    const textToSend = (manualText || input).trim();
    if (!textToSend || isTyping) return;

    const userMessage: Message = { role: 'user', parts: [{ text: textToSend }] };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateImmersiveResponse(updatedMessages, topic!, user.level);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm having trouble connecting right now. Let's try again in a moment." }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleMic = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate STT for the demo
      handleSend("I would like to practice my speaking now.");
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        // Automatic stop after 4 seconds
        setTimeout(() => {
          if (isRecording) setIsRecording(false);
        }, 4000);
      } catch (err) {
        alert("Please allow microphone access to use this feature.");
      }
    }
  };

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto py-20 animate-fadeIn text-center">
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-slate-900">AI IMMERSION</h2>
        <p className="text-slate-500 mb-12 font-medium">Select a focused training environment to begin.</p>
        <div className="grid grid-cols-1 gap-6">
          {['grammar', 'travel', 'general'].map(t => (
            <button key={t} onClick={() => initChat(t as any)} className="p-8 bg-white border-4 border-slate-100 rounded-[40px] hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-50 transition-all text-left group flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase text-slate-900">{t} TRAINING</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t === 'grammar' ? 'Correction & Syntax' : t === 'travel' ? 'Situational Fluency' : 'Natural Conversation'}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 12h14" strokeWidth="3" strokeLinecap="round"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col space-y-4 animate-fadeIn">
      <header className="bg-white p-6 rounded-[32px] border-b-8 border-b-indigo-600 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={()=>setTopic(null)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-black uppercase text-slate-900 leading-none">{topic} SESSION</h2>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Coaching {user.level}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Connection</span>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-200 overflow-hidden flex flex-col shadow-inner">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[32px] ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                <p className="text-lg font-medium leading-relaxed whitespace-pre-line">{m.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-6 rounded-[32px] rounded-bl-none shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t-2 border-slate-50 flex gap-4">
          <button 
            onClick={toggleMic} 
            className={`p-5 rounded-2xl transition-all relative ${
              isRecording 
                ? 'bg-red-500 text-white mic-pulse scale-110 shadow-lg shadow-red-200' 
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
          
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e=>e.key==='Enter'&&handleSend()} 
            placeholder="Type your message..." 
            className="flex-1 p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700" 
          />
          
          <button 
            onClick={()=>handleSend()} 
            disabled={!input.trim() || isTyping} 
            className="bg-indigo-600 text-white p-5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" strokeWidth="3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConversation;
