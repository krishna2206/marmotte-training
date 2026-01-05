export enum Difficulty {
  EASY = 'Débutant',
  MEDIUM = 'Intermédiaire',
  HARD = 'Expert'
}

export interface Question {
  id: string;
  text: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: Difficulty;
  questions: Question[];
  dateGenerated: number;
  score?: number; // Added after completion
}

export interface UserState {
  name: string;
  xp: number;
  streak: number;
  completedQuizzes: Quiz[];
  lastLogin: number;
}

export type AppView = 'HOME' | 'QUIZ' | 'RESULT' | 'HISTORY';