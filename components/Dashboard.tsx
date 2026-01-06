
import React from 'react';
import { Link } from 'react-router-dom';
import { UserProgress } from '../types';

interface DashboardProps {
  user: UserProgress;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const currentLessons = [
    { id: 'business-1', title: 'Professional Greetings', category: 'Business', level: user.level, progress: 45 },
    { id: 'travel-2', title: 'At the Airport', category: 'Travel', level: user.level, progress: 0 },
    { id: 'everyday-3', title: 'Ordering Coffee', category: 'Everyday', level: user.level, progress: 80 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 font-heading">Welcome back!</h2>
        <p className="text-slate-500 mt-1">Ready to continue your journey to fluency?</p>
      </header>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Speaking', val: user.skills.speaking, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Listening', val: user.skills.listening, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Writing', val: user.skills.writing, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Reading', val: user.skills.reading, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((skill) => (
          <div key={skill.label} className={`${skill.bg} p-6 rounded-3xl border border-white/50 shadow-sm`}>
            <p className="text-sm font-medium text-slate-600">{skill.label}</p>
            <div className="flex items-end justify-between mt-2">
              <span className={`text-2xl font-bold ${skill.color}`}>{skill.val}%</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${skill.color.replace('text', 'bg')}`} style={{ width: `${skill.val}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Learning Path */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-heading">Adaptive Learning Path</h3>
            <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {currentLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all group shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full uppercase">{lesson.category}</span>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">{lesson.title}</h4>
                    </div>
                  </div>
                  <Link to={`/lesson/${lesson.id}`} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                    {lesson.progress > 0 ? 'Continue' : 'Start'}
                  </Link>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${lesson.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{lesson.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar / Daily Goals */}
        <section className="space-y-6">
          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-heading mb-2">Daily Streak</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-4xl font-extrabold">{user.streak}</span>
                <span className="text-orange-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.249-2.315-.693-3.334a11.94 11.94 0 01-.457-1.441 15.115 15.115 0 01-.319-1.327 7.099 7.099 0 00-.119-.494 1 1 0 00-1.018-.791 1 1 0 00-.912.72c-.105.348-.219.708-.318 1.05-.082.285-.145.546-.19.776a3.535 3.535 0 01-1.226-2.617c0-.285.03-.546.059-.776.03-.23.059-.441.059-.606a1 1 0 00-1.042-.992z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <p className="text-indigo-200 text-sm">Keep it up! 5 more days for a bonus reward.</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM16.464 16.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold font-heading mb-4">Recommended Challenges</h3>
            <div className="space-y-4">
              <Link to="/practice/chat" className="block p-4 rounded-2xl bg-emerald-50 border border-emerald-100 group transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-700">Coffee Shop Chat</h4>
                    <p className="text-xs text-slate-500">Practice ordering in a busy shop</p>
                  </div>
                </div>
              </Link>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Pronunciation Master</h4>
                    <p className="text-xs text-slate-500">Lock: Complete B1 Module 1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
