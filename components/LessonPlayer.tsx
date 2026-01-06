import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserProgress, FeedbackType, AIFeedback } from '../types.ts';
import { analyzeAnswer, analyzePronunciation } from '../geminiService.ts';

// --- NOVA ESTRUTURA DE DADOS PARA AS LIÇÕES ---

interface Activity {
  id: string;
  type: 'writing' | 'speaking';
  title: string;
  question: string;
  targetAnswer: string;
}

interface Lesson {
  id: string;
  title: string;
  activities: Activity[];
}

// Lição A1: Greetings com 10 atividades
const a1GreetingsLesson: Lesson = {
  id: 'a1-greetings',
  title: 'A1: Greetings & Introductions',
  activities: [
    {
      id: 'greeting-1',
      type: 'writing',
      title: 'Morning Greeting',
      question: 'How would you greet someone in the morning?',
      targetAnswer: 'Good morning.',
    },
    {
      id: 'greeting-2',
      type: 'speaking',
      title: 'Introduce Yourself',
      question: "Repeat this phrase: 'My name is Alex.'",
      targetAnswer: 'My name is Alex.',
    },
    {
      id: 'greeting-3',
      type: 'writing',
      title: 'Ask How Someone Is',
      question: 'How would you ask someone how they are feeling?',
      targetAnswer: 'How are you?',
    },
    {
      id: 'greeting-4',
      type: 'speaking',
      title: 'Respond to "How are you?"',
      question: "Repeat this phrase: 'I'm fine, thank you. And you?'",
      targetAnswer: "I'm fine, thank you. And you?",
    },
    {
      id: 'greeting-5',
      type: 'writing',
      title: 'Afternoon Greeting',
      question: 'How would you greet someone in the afternoon?',
      targetAnswer: 'Good afternoon.',
    },
    {
      id: 'greeting-6',
      type: 'speaking',
      title: 'Say Goodbye',
      question: "Repeat this phrase: 'Goodbye! See you later.'",
      targetAnswer: 'Goodbye! See you later.',
    },
    {
      id: 'greeting-7',
      type: 'writing',
      title: 'Evening Greeting',
      question: 'How would you greet someone in the evening?',
      targetAnswer: 'Good evening.',
    },
    {
      id: 'greeting-8',
      type: 'speaking',
      title: 'Nice to Meet You',
      question: "Repeat this phrase: 'Nice to meet you.'",
      targetAnswer: 'Nice to meet you.',
    },
    {
      id: 'greeting-9',
      type: 'writing',
      title: 'Ask Where Someone Is From',
      question: 'How would you ask someone where they are from?',
      targetAnswer: 'Where are you from?',
    },
    {
      id: 'greeting-10',
      type: 'speaking',
      title: 'Say Where You Are From',
      question: "Repeat this phrase: 'I'm from Brazil.'",
      targetAnswer: "I'm from Brazil.",
    },
  ],
};

// Mapa de todas as lições disponíveis
const lessons: { [key: string]: Lesson } = {
  'a1-greetings': a1GreetingsLesson,
};

// --- COMPONENTE ---

interface LessonPlayerProps {
  user: UserProgress;
  onUpdateProgress: (user: UserProgress) => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ user, onUpdateProgress }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estado para controlar a atividade atual
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Encontra a lição e a atividade atual usando useMemo para performance
  const lesson = useMemo(() => (id ? lessons[id] : null), [id]);
  const currentActivity = useMemo(() => lesson?.activities[currentActivityIndex], [lesson, currentActivityIndex]);

  // Redireciona se a lição não for encontrada
  useEffect(() => {
    if (!lesson) {
      navigate('/dashboard');
    }
  }, [lesson, navigate]);

  // Reseta o estado da resposta quando a atividade muda
  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setIsRecording(false);
    setRecordingTime(0);
  }, [currentActivityIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!lesson || !currentActivity) {
    return <div>Loading...</div>; // Ou um componente de loading
  }

  const isSpeakingTask = currentActivity.type === 'speaking';
  const xpPerActivity = 50;
  const totalXp = lesson.activities.length * xpPerActivity;
  const skillIncreasePerLesson = 10;

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
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        // Usa a resposta alvo da ATIVIDADE ATUAL
        const result = await analyzePronunciation(currentActivity.targetAnswer, base64Audio, 'audio/webm');
        setFeedback(result);
        setIsSubmitting(false);
      };
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Usa a pergunta e resposta da ATIVIDADE ATUAL
      const result = await analyzeAnswer(currentActivity.question, answer);
      setFeedback(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const isPass = (feedback?.score ?? 100) > 60;
    
    if (isPass && (feedback?.type === FeedbackType.PERFECT || feedback?.type === FeedbackType.IMPROVABLE)) {
      // Verifica se é a última atividade
      if (currentActivityIndex < lesson.activities.length - 1) {
        // Avança para a próxima atividade
        setCurrentActivityIndex(prev => prev + 1);
      } else {
        // Finaliza a lição
        setIsComplete(true);
        const updatedUser = {
          ...user,
          xp: user.xp + totalXp,
          skills: { 
            ...user.skills, 
            [isSpeakingTask ? 'speaking' : 'writing']: Math.min(100, user.skills[isSpeakingTask ? 'speaking' : 'writing'] + skillIncreasePerLesson) 
          }
        };
        onUpdateProgress(updatedUser);
      }
    } else {
      // Se falhou, limpa o feedback para tentar novamente
      setFeedback(null);
      setAnswer('');
    }
  };

  const getFeedbackStyles = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.PERFECT: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '🟢' };
      case FeedbackType.IMPROVABLE: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '🔵' };
      case FeedbackType.UNNATURAL: return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '🟠' };
      case FeedbackType.INCORRECT: return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🔴' };
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-8 scale-110 animate-pulse">
           <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-4xl font-bold font-heading mb-4">Lesson Complete!</h2>
        <p className="text-slate-500 mb-2">You've mastered the "{lesson.title}" lesson.</p>
        <p className="text-slate-500 mb-8">You earned {totalXp} XP and improved your skills.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const styles = feedback ? getFeedbackStyles(feedback.type) : null;
  const isFailedScore = feedback?.score !== undefined && feedback.score <= 60;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8 animate-fadeIn">
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-600 mb-2 flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Cancel Lesson
          </button>
          <h2 className="text-2xl font-bold font-heading">{lesson.title}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Activity {currentActivityIndex + 1}/{lesson.activities.length}
          </p>
          <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
              style={{ width: `${((currentActivityIndex + 1) / lesson.activities.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">
            {isSpeakingTask ? 'Speaking Mission' : 'Writing Mission'}
          </p>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">{currentActivity.question}</h3>
        </div>

        <div className="space-y-4">
          {!isSpeakingTask ? (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!feedback || isSubmitting}
              placeholder="Type your response here..."
              className="w-full h-40 p-6 bg-white border-2 border-slate-200 rounded-3xl focus:border-indigo-600 outline-none text-lg transition-all shadow-sm"
            />
          ) : (
            <div className="flex flex-col items-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
               {isRecording && (
                 <div className="absolute inset-0 bg-red-50/50 flex items-center justify-center animate-pulse">
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(i => <div key={i} className="w-1 bg-red-400 rounded-full animate-grow" style={{ animationDelay: `${i*0.1}s`, height: '20px' }}></div>)}
                    </div>
                 </div>
               )}
               
               <p className="text-slate-400 font-bold mb-6">{isRecording ? `Recording... ${recordingTime}s` : 'Ready to speak?'}</p>
               
               {!feedback && !isSubmitting && (
                 <button
                   onMouseDown={startRecording}
                   onMouseUp={stopRecording}
                   className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                     isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                   }`}
                 >
                   {isRecording ? (
                     <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                   ) : (
                     <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                   )}
                 </button>
               )}
               
               {isSubmitting && (
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-indigo-600 animate-pulse">Gemini is listening...</p>
                 </div>
               )}
            </div>
          )}

          {!feedback && !isSpeakingTask && (
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Analyzing mastery...' : 'Check Answer'}
            </button>
          )}

          {feedback && (
            <div className={`p-8 rounded-3xl border-2 ${styles?.bg} ${styles?.border} space-y-4 animate-slideUp`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{styles?.icon}</span>
                  <span className={`font-bold text-lg ${styles?.text}`}>{feedback.type.replace('_', ' ')}</span>
                </div>
                {feedback.score !== undefined && (
                  <div className={`text-2xl font-black ${feedback.score > 60 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {feedback.score}%
                  </div>
                )}
              </div>
              <button
                onClick={handleNext}
                className={`w-full py-4 mt-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                  !isFailedScore ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                {!isFailedScore ? (currentActivityIndex < lesson.activities.length - 1 ? 'Next Activity' : 'Finish Lesson') : 'Try Again'}
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
      `}</style>
    </div>
  );
};

export default LessonPlayer;
