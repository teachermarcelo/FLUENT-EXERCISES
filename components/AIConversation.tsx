
import React, { useState, useRef, useEffect } from 'react';
import { UserProgress } from '../types';
import { GoogleGenAI } from "@google/genai";

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
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const initChat = (selectedTopic: 'grammar' | 'travel' | 'general') => {
    setTopic(selectedTopic);
    let initialGreeting = "";
    switch(selectedTopic) {
      case 'grammar': initialGreeting = "Hello! I'm your Grammar Coach. Type or say something, and I'll help you refine your syntax while we talk. What should we discuss?"; break;
      case 'travel': initialGreeting = "Welcome to London! I'm your local guide. Need help navigating the city or checking into your hotel?"; break;
      case 'general': initialGreeting = "Hi there! I'm ready for a free-flow conversation. What's on your mind today?"; break;
    }
    setMessages([{ role: 'model', parts: [{ text: initialGreeting }] }]);
  };

  const handleSend = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', parts: [{ text: content }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `
        You are an elite immersive English partner in a platform called FLUENT IMMERSION.
        Topic Mode: ${topic}.
        User Proficiency: ${user.level}.
        
        CRITICAL RULES:
        1. Keep the conversation extremely interactive and engaging.
        2. If the user makes a mistake (Grammar, Lexical, Naturalness), DON'T just list it. 
        3. Use the 'Sandwich Method': 
           - Reply to the content naturally first.
           - Briefly mention a better/corrected way to say what they just said using '*' or italics.
           - End with a thought-provoking question to keep the flow.
        4. Match the tone of a friendly native speaker.
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction }
      });

      // Send the whole history but Gemini Chat manages context usually.
      // For simplicity, we send the last message here.
      const response = await chat.sendMessage({ message: content });
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm having a small connection issue. Can you try again?" }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        // Note: Real transcription would need a dedicated speech-to-text service or Gemini multi-modal input.
        // For this UI mockup/prototype, we simulate the STT result as the model doesn't support direct RT transcription here easily without a heavy SDK wrapper.
        // We will just alert that "Mic input is active" and simulate a response if it were a real production app.
        
        mediaRecorder.start();
        setIsRecording(true);
        
        setTimeout(() => {
           if (isRecording) {
             mediaRecorder.stop();
             setIsRecording(false);
             handleSend("Simulated speech-to-text input based on user audio environment.");
           }
        }, 3000);
      } catch (err) {
        alert("Mic access denied.");
      }
    }
  };

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto py-20 animate-fadeIn">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black font-heading text-slate-900 uppercase tracking-tight">AI IMMERSION</h2>
          <p className="text-slate-500 mt-2 font-bold tracking-widest uppercase text-xs">Choose your training scenario</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => initChat('grammar')} className="group p-8 bg-white border-2 border-slate-100 rounded-[40px] hover:border-indigo-600 transition-all text-left flex items-center gap-6 shadow-sm hover:shadow-xl">
             <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase">Grammar Coach</h3>
                <p className="text-sm text-slate-400 font-medium">Real-time corrections and syntax optimization.</p>
             </div>
          </button>
          <button onClick={() => initChat('travel')} className="group p-8 bg-white border-2 border-slate-100 rounded-[40px] hover:border-emerald-600 transition-all text-left flex items-center gap-6 shadow-sm hover:shadow-xl">
             <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase">Travel Simulation</h3>
                <p className="text-sm text-slate-400 font-medium">Roleplay scenarios: Airports, Hotels & Cafes.</p>
             </div>
          </button>
          <button onClick={() => initChat('general')} className="group p-8 bg-white border-2 border-slate-100 rounded-[40px] hover:border-amber-600 transition-all text-left flex items-center gap-6 shadow-sm hover:shadow-xl">
             <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase">General Free Flow</h3>
                <p className="text-sm text-slate-400 font-medium">Unstructured talk to build confidence and fluency.</p>
             </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col space-y-4 animate-fadeIn">
      <header className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-b-4 border-b-indigo-600">
        <div className="flex items-center gap-4">
          <button onClick={() => setTopic(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 className="text-xl font-black font-heading uppercase text-slate-900">{topic} PRACTICE</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">AI Immersion Session Active</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-[40px] overflow-hidden flex flex-col shadow-inner relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}>
              <div className={`max-w-[85%] p-6 rounded-[32px] ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                <p className="text-lg leading-relaxed whitespace-pre-line">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-white border border-slate-100 p-6 rounded-[32px] rounded-bl-none">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex gap-3">
            <button 
              onMouseDown={toggleRecording}
              className={`p-5 rounded-2xl transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white mic-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Interact with FLUENT IMMERSION..."
              className="flex-1 p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 text-white p-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversation;
