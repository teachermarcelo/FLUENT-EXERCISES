
import React, { useState, useRef, useEffect } from 'react';
import { UserProgress } from '../types';
import { generateConversationResponse } from '../geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const AIConversation: React.FC<{ user: UserProgress }> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: "Hello! Welcome to the London Cafe. What can I get started for you today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const situation = "In a bustling coffee shop in London. You are the barista, the user is the customer.";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateConversationResponse([...messages, userMsg], situation);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col space-y-4 animate-fadeIn">
      <header className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">Coffee Shop Chat</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Simulation: London Barista</p>
          </div>
        </div>
        <div className="hidden md:block">
           <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">Live Practice</span>
        </div>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-[40px] overflow-hidden flex flex-col shadow-inner">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
              <div className={`max-w-[80%] p-5 rounded-[28px] ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <p className="text-lg leading-relaxed">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-slate-50 text-slate-400 p-5 rounded-[28px] rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="flex-1 p-5 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 outline-none transition-all shadow-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 text-white p-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-4 font-bold">Press Enter to send message</p>
        </div>
      </div>
    </div>
  );
};

export default AIConversation;
