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

export interface CourseContent {
  text: string; // Markdown content
  codeSnippet?: string;
}

export interface Module {
  id: string;
  title: string;
  content: CourseContent; // The lesson
  quiz?: Question; // Mini-quiz at the end of the module
}

export interface Course {
  id: string;
  topic: string;
  difficulty: Difficulty;
  modules: Module[];
  dateGenerated: number;
  completedModules: string[]; // IDs of completed modules
  isCompleted: boolean;
}

export interface UserState {
  name: string;
  xp: number;
  streak: number;
  completedQuizzes: Quiz[];
  completedCourses: Course[];
  lastLogin: number;
}

export type AppView = 'HOME' | 'QUIZ' | 'RESULT' | 'HISTORY' | 'COURSE';