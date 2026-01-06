
export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProgress {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  level: ProficiencyLevel;
  xp: number;
  streak: number;
  completedLessons: string[];
  skills: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  teacherId?: string;
  lastLogin?: string;
  totalSessionTime?: number; // em segundos
  email?: string;
  whatsapp?: string;
  certificates: string[];
}

export enum FeedbackType {
  PERFECT = 'PERFECT',
  IMPROVABLE = 'IMPROVABLE',
  UNNATURAL = 'UNNATURAL',
  INCORRECT = 'INCORRECT'
}

export enum TaskType {
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  READING = 'READING',
  LISTENING = 'LISTENING'
}

export interface LessonTask {
  id: string;
  type: TaskType;
  question: string;
  targetText?: string; // For speaking or specific reading tasks
  options?: string[]; // For multiple choice reading tasks
  audioText?: string; // For listening tasks (model reads/simulates)
  xpReward: number;
  skillImpact: 'speaking' | 'listening' | 'reading' | 'writing';
}

export interface AIFeedback {
  type: FeedbackType;
  correction: string;
  explanation: string;
  naturalAlternative?: string;
  score?: number;
}
