
export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserProgress {
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
}

export enum FeedbackType {
  PERFECT = 'PERFECT',       // Green
  IMPROVABLE = 'IMPROVABLE', // Blue
  UNNATURAL = 'UNNATURAL',   // Orange
  INCORRECT = 'INCORRECT'    // Red
}

export interface AIFeedback {
  type: FeedbackType;
  correction: string;
  explanation: string;
  naturalAlternative?: string;
  score?: number; // Pontuação de 0 a 100 para pronúncia/escrita
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'dictation' | 'translation' | 'speaking' | 'free-writing';
  question: string;
  context?: string;
  correctAnswer?: string;
  options?: string[];
  audioUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'Business' | 'Academic' | 'Travel' | 'Everyday' | 'Tech';
  level: ProficiencyLevel;
  exercises: Exercise[];
}
