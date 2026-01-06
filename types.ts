
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
  teacherId?: string; // Para alunos: quem é o professor
  lastLogin?: string;
  certificates: string[]; // Níveis concluídos
}

export enum FeedbackType {
  PERFECT = 'PERFECT',
  IMPROVABLE = 'IMPROVABLE',
  UNNATURAL = 'UNNATURAL',
  INCORRECT = 'INCORRECT'
}

export interface AIFeedback {
  type: FeedbackType;
  correction: string;
  explanation: string;
  naturalAlternative?: string;
  score?: number;
}
