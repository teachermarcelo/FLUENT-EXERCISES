
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserProgress, FeedbackType, AIFeedback, TaskType, LessonTask } from '../types.ts';
import { analyzeAnswer, analyzePronunciation } from '../geminiService.ts';
import { LESSON_DATA } from '../data/lessons.ts';

interface LessonPlayerProps {
  user: UserProgress;
  onUpdateProgress: (user: UserProgress) => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ user, onUpdateProgress }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const lessonTasks = useMemo(() => (id ? LESSON_DATA[id] || [] : []), [id]);
  const progressKey = `ll_progress_${user.id}_${id}`;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(() => {
    const saved = localStorage.getItem(progressKey);
    return saved ? Math.min(parseInt(saved, 10), Math.max(0, (LESSON_DATA[id || '']?.length || 1) - 1)) : 0;
  });

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  // Voz e Auto-Stop
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const silenceTimerRef = useRef<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentTask = useMemo(() => lessonTasks[currentTaskIndex], [lessonTasks, currentTaskIndex]);

  useEffect(() => {
    localStorage.setItem(progressKey, currentTaskIndex.toString());
  }, [currentTaskIndex, progressKey]);

  useEffect(() => {
    if (id && !LESSON_DATA[id]) navigate('/dashboard');
  }, [id, navigate]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setIsRecording(false);
    setRecordingTime(0);
    silenceTimerRef.current = null;
  }, [currentTaskIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, average * 1.5));

        // DETECTOR DE SILÊNCIO (Auto-stop se < 5 de volume por 2.5 segundos)
        if (average < 5) {
          if (!silenceTimerRef.current) silenceTimerRef.current = Date.now();
          else if (Date.now() - silenceTimerRef.current > 2500) {
            stopRecording();
          }
        } else {
          silenceTimerRef.current = null;
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        setAudioLevel(0);
        await handleAudioSubmit(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert("Permita o uso do microfone.");
    }
  };

  const handleAudioSubmit = async (blob: Blob) => {
    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const result = await analyzePronunciation(currentTask.targetText || '', base64Audio, 'audio/webm');
        setFeedback(result);
        setIsSubmitting(false);
      };
    } catch (e) {
      setFeedback({ type: FeedbackType.INCORRECT, score: 0, explanation: "Falha de áudio.", correction: "" });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if ((!answer.trim() && currentTask.type !== TaskType.READING) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Para o Reading de múltipla escolha, fazemos uma checagem local rápida primeiro para ser infalível
      if (currentTask.type === TaskType.READING) {
        const isCorrect = answer.trim().toLowerCase() === (currentTask.targetText || '').trim().toLowerCase();
        if (isCorrect) {
          setFeedback({ type: FeedbackType.PERFECT, score: 100, explanation: "Correto! Excelente escolha.", correction: "" });
          setIsSubmitting(false);
          return;
        }
      }

      const result = await analyzeAnswer(currentTask.question, answer);
      setFeedback(result);
    } catch (e) {
      setFeedback({ type: FeedbackType.INCORRECT, score: 0, explanation: "Serviço indisponível.", correction: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPass = useMemo(() => (feedback?.score ?? 0) >= 70, [feedback]);

  const handleNext = (forceSkip = false) => {
    if (isPass || forceSkip) {
      if (isPass) setTotalXpEarned(prev => prev + (currentTask.xpReward || 0));
      if (currentTaskIndex < lessonTasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      } else {
        finishLesson();
      }
    } else {
      setFeedback(null);
      if (currentTask.type !== TaskType.READING) setAnswer('');
    }
  };

  const finishLesson = () => {
    setIsComplete(true);
    localStorage.removeItem(progressKey);
    const finalXp = totalXpEarned + (isPass ? (currentTask.xpReward || 0) : 0);
    const updatedUser = {
      ...user,
      xp: user.xp + finalXp,
      completedLessons: Array.from(new Set([...user.completedLessons, id || ''])),
      skills: { ...user.skills }
    };
    const skillToUpdate = currentTask.skillImpact;
    updatedUser.skills[skillToUpdate] = Math.min(100, updatedUser.skills[skillToUpdate] + (isPass ? 5 : 1));
    onUpdateProgress(updatedUser);
  };

  const getStyles = (type: string) => {
    if (!isPass && feedback) return { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600', icon: '⚠️' };
    switch (type) {
      case 'PERFECT': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '🟢' };
      case 'IMPROVABLE': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '🔵' };
      case 'UNNATURAL': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '🟠' };
      default: return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🔴' };
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn text-center px-6">
        <div className="w-40 h-40 bg-indigo-600 rounded-[48px] flex items-center justify-center text-white mb-10 shadow-2xl rotate-3">
           <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-5xl font-black font-heading mb-4 tracking-tighter text-slate-900 uppercase">Missão Concluída!</h2>
        <p className="text-slate-500 mb-10 font-bold text-xl">Total de XP: <span className="text-indigo-600">+{totalXpEarned}</span></p>
        <button onClick={() => navigate('/dashboard')} className="px-16 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95">Painel de Controle</button>
      </div>
    );
  }

  const styles = feedback ? getStyles(feedback.type) : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-600 transition-all text-slate-400 hover:text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-black font-heading text-slate-900 uppercase tracking-tighter">Missão {currentTaskIndex + 1}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Atividade {currentTaskIndex + 1} de {lessonTasks.length}</span>
               <span className="text-[8px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-black uppercase">Progresso Salvo</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-64">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${((currentTaskIndex + 1) / lessonTasks.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="bg-white p-10 md:p-14 rounded-[48px] border border-slate-200 shadow-xl shadow-slate-100 relative min-h-[500px] flex flex-col">
         <div className="absolute top-0 right-0 p-10">
            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
              currentTask.type === TaskType.SPEAKING ? 'bg-rose-100 text-rose-600' :
              currentTask.type === TaskType.WRITING ? 'bg-indigo-100 text-indigo-600' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {currentTask.type} Mode
            </span>
         </div>

         <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-4">{currentTask.question}</h3>
            {currentTask.type === TaskType.LISTENING && !feedback && (
                <button onClick={() => { const u = new SpeechSynthesisUtterance(currentTask.audioText || ''); u.lang = 'en-US'; window.speechSynthesis.speak(u); }} className="p-5 bg-amber-50 text-amber-600 rounded-[24px] border border-amber-100 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 active:scale-95 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                  Tocar Áudio
                </button>
            )}
         </div>

         <div className="flex-1">
            {currentTask.type === TaskType.SPEAKING ? (
              <div className="flex flex-col items-center py-12 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 relative group transition-all">
                  {isRecording && (
                    <div className="absolute inset-0 bg-indigo-50/30 flex items-center justify-center pointer-events-none">
                      <div className="flex gap-1 h-32 items-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                          <div 
                            key={i} 
                            className="w-2 bg-indigo-500 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(10, audioLevel * (0.5 + Math.random()))}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!feedback && !isSubmitting && (
                    <div className="text-center z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
                        {isRecording ? `Captando... Auto-stop em silêncio` : 'Pressione e segure para falar'}
                      </p>
                      <button
                        onMouseDown={startRecording} onMouseUp={stopRecording}
                        onTouchStart={startRecording} onTouchEnd={stopRecording}
                        className={`w-32 h-32 rounded-[40px] flex items-center justify-center transition-all shadow-2xl ${
                          isRecording ? 'bg-rose-500 scale-110 ring-8 ring-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                        }`}
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          {isRecording ? <rect x="6" y="6" width="12" height="12" rx="4" /> : <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />}
                        </svg>
                      </button>
                    </div>
                  )}

                  {isSubmitting && (
                    <div className="flex flex-col items-center gap-4 py-10">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Validando fonemas...</p>
                    </div>
                  )}
              </div>
            ) : currentTask.type === TaskType.READING ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentTask.options?.map(opt => (
                    <button key={opt} onClick={() => setAnswer(opt)} disabled={!!feedback || isSubmitting} className={`p-6 rounded-[32px] border-2 font-bold text-lg text-left transition-all active:scale-95 ${answer === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50'}`}>{opt}</button>
                  ))}
                </div>
            ) : (
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} disabled={!!feedback || isSubmitting} placeholder="Sua resposta aqui..." className="w-full h-44 p-8 bg-slate-50 border-2 border-slate-100 rounded-[40px] focus:border-indigo-600 focus:bg-white outline-none text-xl font-bold transition-all shadow-inner resize-none" />
            )}
         </div>

         {!feedback && currentTask.type !== TaskType.SPEAKING && (
            <div className="mt-8 flex justify-end">
              <button onClick={handleSubmit} disabled={(!answer.trim() && currentTask.type !== TaskType.READING) || isSubmitting} className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Analisando...' : 'Verificar Resposta'}
              </button>
            </div>
         )}

         {feedback && (
          <div className={`mt-8 p-10 rounded-[48px] border-2 animate-slideUp ${styles?.bg} ${styles?.border}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{styles?.icon}</span>
                <div>
                  <span className={`font-black text-[10px] uppercase tracking-widest ${styles?.text}`}>
                      {feedback.type.replace('_', ' ')} {!isPass && '(Nota < 7.0)'}
                  </span>
                  <p className="text-slate-700 font-bold mt-1">
                      {feedback.explanation}
                  </p>
                </div>
              </div>
              <div className={`text-4xl font-black shrink-0 ${isPass ? 'text-emerald-600' : 'text-slate-400'}`}>
                {(feedback.score! / 10).toFixed(1)}
              </div>
            </div>
            
            {!isPass && (currentTask.type === TaskType.WRITING || currentTask.type === TaskType.LISTENING || currentTask.type === TaskType.READING) && (
              <div className="mt-6 p-6 bg-white/50 rounded-3xl border border-white">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Gabarito Master</p>
                <p className="text-slate-800 font-bold">{currentTask.targetText}</p>
              </div>
            )}

            {feedback.correction && isPass && (
              <div className="mt-6 p-6 bg-white/50 rounded-3xl border border-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dica Pedagógica</p>
                <p className="text-slate-800 font-bold">{feedback.correction}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
               {!isPass ? (
                 <>
                   <button
                     onClick={() => handleNext(false)}
                     className="flex-1 py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase text-sm tracking-widest transition-all shadow-2xl active:scale-95"
                   >
                     Refazer Task
                   </button>
                   <button
                     onClick={() => handleNext(true)}
                     className="flex-1 py-6 bg-white border-2 border-slate-200 text-slate-600 rounded-[28px] font-black uppercase text-sm tracking-widest transition-all hover:bg-slate-50 active:scale-95"
                   >
                     Pular e Concluir
                   </button>
                 </>
               ) : (
                 <button
                   onClick={() => handleNext(false)}
                   className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[28px] font-black uppercase text-sm tracking-widest transition-all shadow-2xl active:scale-95"
                 >
                   {currentTaskIndex < lessonTasks.length - 1 ? 'Próxima Missão' : 'Finalizar Módulo'}
                 </button>
               )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default LessonPlayer;
