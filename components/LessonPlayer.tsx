
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
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const currentTask = useMemo(() => lessonTasks[currentTaskIndex], [lessonTasks, currentTaskIndex]);

  useEffect(() => {
    if (id && !LESSON_DATA[id]) {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setIsRecording(false);
    setRecordingTime(0);
  }, [currentTaskIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!currentTask) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Loading Task...</div>;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioSubmit(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access denied. Please enable it in settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleAudioSubmit = async (blob: Blob) => {
    setIsSubmitting(true);
    setFeedback(null);
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
      console.error(e);
      setFeedback({
        type: FeedbackType.INCORRECT,
        score: 0,
        explanation: "Error processing audio.",
        correction: "Please try again."
      });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if ((!answer.trim() && currentTask.type !== TaskType.READING) || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await analyzeAnswer(currentTask.question, answer);
      setFeedback(result);
    } catch (e) {
      console.error(e);
      setFeedback({
        type: FeedbackType.INCORRECT,
        score: 0,
        explanation: "Verification failed.",
        correction: "AI teacher is momentarily unavailable."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const isPass = (feedback?.score ?? 100) > 60;
    
    if (isPass) {
      setTotalXpEarned(prev => prev + (currentTask.xpReward || 0));
      
      if (currentTaskIndex < lessonTasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      } else {
        finishLesson();
      }
    } else {
      setFeedback(null);
      setAnswer('');
    }
  };

  const finishLesson = () => {
    setIsComplete(true);
    const finalXp = totalXpEarned + (currentTask.xpReward || 0);
    const updatedUser = {
      ...user,
      xp: user.xp + finalXp,
      completedLessons: Array.from(new Set([...user.completedLessons, id || ''])),
      skills: { ...user.skills }
    };
    
    const skillToUpdate = currentTask.skillImpact;
    updatedUser.skills[skillToUpdate] = Math.min(100, updatedUser.skills[skillToUpdate] + 5);
    
    onUpdateProgress(updatedUser);
  };

  const getFeedbackStyles = (type: string) => {
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
        <div className="w-40 h-40 bg-indigo-600 rounded-[48px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-indigo-100 rotate-3">
           <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-5xl font-black font-heading mb-4 tracking-tighter text-slate-900 uppercase">Mastery Achieved!</h2>
        <p className="text-slate-500 mb-10 font-bold text-xl leading-relaxed">You mastered <span className="text-indigo-600">{lessonTasks.length} tasks</span> of the A1 Greetings module.</p>
        <p className="text-slate-500 mb-12 font-bold text-xl">Total XP Gained: <span className="text-indigo-600">+{totalXpEarned}</span></p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-16 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const styles = feedback ? getFeedbackStyles(feedback.type) : null;
  const isFailedScore = feedback?.score !== undefined && feedback.score <= 60;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-600 transition-all text-slate-400 hover:text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-black font-heading text-slate-900 uppercase tracking-tighter">A1: Greetings & Introductions</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task {currentTaskIndex + 1} of {lessonTasks.length}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{Math.round(((currentTaskIndex + 1) / lessonTasks.length) * 100)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${((currentTaskIndex + 1) / lessonTasks.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-10 md:p-14 rounded-[48px] border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden min-h-[500px] flex flex-col">
           <div className="absolute top-0 right-0 p-10">
              <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                currentTask.type === TaskType.SPEAKING ? 'bg-rose-100 text-rose-600' :
                currentTask.type === TaskType.WRITING ? 'bg-indigo-100 text-indigo-600' :
                currentTask.type === TaskType.LISTENING ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {currentTask.type} Mission
              </span>
           </div>

           <div className="max-w-2xl mb-8">
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-4">Instructions</p>
              <h3 className="text-3xl font-bold text-slate-900 leading-tight">{currentTask.question}</h3>
              
              {currentTask.type === TaskType.LISTENING && !feedback && (
                <button 
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(currentTask.audioText || '');
                    utterance.lang = 'en-US';
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="mt-8 p-6 bg-amber-50 text-amber-600 rounded-[32px] border-2 border-amber-100 flex items-center gap-4 hover:bg-amber-100 transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </div>
                  <span className="font-black uppercase text-xs tracking-widest">Listen to Audio</span>
                </button>
              )}
           </div>

           <div className="flex-1 space-y-6">
              {currentTask.type === TaskType.READING ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentTask.options?.map((opt) => (
                    <button
                      key={opt}
                      disabled={!!feedback || isSubmitting}
                      onClick={() => { setAnswer(opt); }}
                      className={`p-6 rounded-[32px] border-2 font-bold text-lg text-left transition-all ${
                        answer === opt 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : currentTask.type === TaskType.SPEAKING ? (
                <div className="flex flex-col items-center py-12 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 relative overflow-hidden group">
                   {isRecording && (
                     <div className="absolute inset-0 bg-rose-50/50 flex items-center justify-center animate-pulse">
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(i => <div key={i} className="w-2 bg-rose-400 rounded-full animate-grow" style={{ animationDelay: `${i*0.1}s`, height: '40px' }}></div>)}
                        </div>
                     </div>
                   )}
                   
                   {!feedback && !isSubmitting && (
                     <>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-8">{isRecording ? `Recording... ${recordingTime}s` : 'Press and hold to speak'}</p>
                        <button
                          onMouseDown={startRecording}
                          onMouseUp={stopRecording}
                          onTouchStart={startRecording}
                          onTouchEnd={stopRecording}
                          className={`w-32 h-32 rounded-[40px] flex items-center justify-center transition-all shadow-2xl relative z-10 ${
                            isRecording ? 'bg-rose-500 scale-110 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                          }`}
                        >
                          {isRecording ? (
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="4" /></svg>
                          ) : (
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                          )}
                        </button>
                     </>
                   )}
                   
                   {isSubmitting && (
                     <div className="flex flex-col items-center gap-6 py-10">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest animate-pulse">Gemini is evaluating...</p>
                     </div>
                   )}
                </div>
              ) : (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!!feedback || isSubmitting}
                  placeholder="Your linguistic answer here..."
                  className="w-full h-44 p-8 bg-slate-50 border-2 border-slate-100 rounded-[40px] focus:border-indigo-600 focus:bg-white outline-none text-xl font-bold transition-all shadow-inner resize-none"
                />
              )}
           </div>

           {!feedback && currentTask.type !== TaskType.SPEAKING && (
              <div className="mt-auto flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={(!answer.trim() && currentTask.type !== TaskType.READING) || isSubmitting}
                  className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95 mt-4"
                >
                  {isSubmitting ? 'Verifying...' : 'Check Answer'}
                </button>
              </div>
           )}

           {feedback && (
            <div className={`mt-8 p-10 rounded-[48px] border-2 animate-slideUp ${styles?.bg} ${styles?.border}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{styles?.icon}</span>
                  <div>
                    <span className={`font-black text-xs uppercase tracking-widest ${styles?.text}`}>{feedback.type.replace('_', ' ')}</span>
                    <p className="text-slate-700 font-bold mt-1">{feedback.explanation}</p>
                  </div>
                </div>
                {feedback.score !== undefined && (
                  <div className={`text-4xl font-black shrink-0 ${feedback.score > 60 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {feedback.score}%
                  </div>
                )}
              </div>
              
              {feedback.correction && (
                <div className="mt-6 p-6 bg-white/50 rounded-3xl border border-white">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coach Correction</p>
                  <p className="text-slate-800 font-bold">{feedback.correction}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className={`w-full py-6 mt-10 rounded-[28px] font-black uppercase text-sm tracking-widest text-white transition-all shadow-2xl active:scale-95 ${
                  !isFailedScore ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                {!isFailedScore ? (currentTaskIndex < lessonTasks.length - 1 ? 'Next Task' : 'Finish Module') : 'Try This Task Again'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes grow {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.5); }
        }
        .animate-grow {
          animation: grow 0.8s ease-in-out infinite;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LessonPlayer;
