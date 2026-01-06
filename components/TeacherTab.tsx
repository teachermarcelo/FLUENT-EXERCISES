
import React, { useState, useEffect } from 'react';
import { UserProgress } from '../types';

const TeacherTab: React.FC<{ currentUser: UserProgress }> = ({ currentUser }) => {
  const [myStudents, setMyStudents] = useState<UserProgress[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('lingualeap_db') || '[]');
    const students = db.filter((u: UserProgress) => 
      u.role === 'student' && (u.teacherId === currentUser.id || currentUser.role === 'admin')
    );
    setMyStudents(students);
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold font-heading text-slate-900">Teacher Dashboard</h2>
        <p className="text-slate-500">Monitoring {myStudents.length} students assigned to you.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myStudents.map(student => (
          <div key={student.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold">
                {student.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{student.username}</h3>
                <p className="text-xs text-slate-500 uppercase font-black">Level {student.level}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Progress (XP)</span>
                <span className="text-indigo-600 font-black">{student.xp}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (student.xp/5000)*100)}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(student.skills).map(([skill, val]) => (
                  <div key={skill} className="bg-slate-50 p-2 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{skill}</p>
                    <p className="text-sm font-black text-slate-700">{val}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400">
              <span>Last Active</span>
              <span className="font-bold">{student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
      
      {myStudents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
          <p className="text-slate-500">No students assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherTab;
