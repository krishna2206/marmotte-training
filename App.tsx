import React, { useState, useEffect } from 'react';
import { generateQuizQuestions, generateCourse } from './services/geminiService';
import { Quiz, UserState, AppView, Difficulty, Course } from './types';
import Button from './components/Button';
import Mascot from './components/Mascot';
import XPCounter from './components/XPCounter';
import QuizComponent from './components/QuizComponent';
import CourseViewer from './components/CourseViewer';

export default function App() {
  // -- State --
  const [view, setView] = useState<AppView>('HOME');
  const [user, setUser] = useState<UserState>({
    name: 'Marmotte',
    xp: 0,
    streak: 0,
    completedQuizzes: [],
    completedCourses: [],
    lastLogin: Date.now()
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  const [selectedTopic, setSelectedTopic] = useState("React");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [homeMode, setHomeMode] = useState<'QUIZ' | 'COURSE'>('QUIZ');

  useEffect(() => {
    const savedUser = localStorage.getItem('devmarmotte_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('devmarmotte_user', JSON.stringify(user));
  }, [user]);

  const startActivity = async () => {
    setLoading(true);
    setLoadingMessage(homeMode === 'QUIZ' ? "Génération du quiz..." : "Création du cours...");

    try {
      if (homeMode === 'QUIZ') {
        const questions = await generateQuizQuestions(selectedTopic, selectedDifficulty);
        const newQuiz: Quiz = {
          id: Date.now().toString(),
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          questions: questions,
          dateGenerated: Date.now(),
          score: 0
        };
        setCurrentQuiz(newQuiz);
        setView('QUIZ');
      } else {
        const modules = await generateCourse(selectedTopic, selectedDifficulty);
        // Verify if modules appear valid, otherwise handle error (omitted for brevity)
        const newCourse: Course = {
          id: `course-${Date.now()}`,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          modules: modules,
          dateGenerated: Date.now(),
          completedModules: [],
          isCompleted: false
        };
        setCurrentCourse(newCourse);
        setView('COURSE');
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (score: number) => {
    if (!currentQuiz) return;
    const finalQuiz = { ...currentQuiz, score };
    const xpGained = score * 10 + 20;

    const updatedUser = {
      ...user,
      xp: user.xp + xpGained,
      completedQuizzes: [...user.completedQuizzes, finalQuiz],
      streak: user.streak + 1
    };
    setUser(updatedUser);
    setCurrentQuiz(finalQuiz); // Update local state for Result view
    setView('RESULT');
  };

  const handleCourseComplete = () => {
    if (!currentCourse) return;
    // Fixed XP for course completion
    const xpGained = 150;
    const updatedCourse = { ...currentCourse, isCompleted: true };

    const updatedUser = {
      ...user,
      xp: user.xp + xpGained,
      completedCourses: [...user.completedCourses || [], updatedCourse], // Handle legacy state without completedCourses
      streak: user.streak + 1
    };
    setUser(updatedUser);
    setView('RESULT');
  };

  const renderHome = () => (
    <div className="flex flex-col h-full bg-white p-6 max-w-md mx-auto">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-extrabold text-duo-green tracking-wide">DevMarmotte</h1>
        <XPCounter xp={user.xp} streak={user.streak} />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <Mascot emotion="happy" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-duo-text">Salut, Marmotte ! 🦦</h2>
          <p className="text-duo-gray-dark font-medium">Qu'apprenons-nous aujourd'hui ?</p>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-full">
          <button
            onClick={() => setHomeMode('QUIZ')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${homeMode === 'QUIZ' ? 'bg-white shadow text-duo-green-dark' : 'text-duo-gray-dark'}`}
          >
            QUIZ RAPIDE
          </button>
          <button
            onClick={() => setHomeMode('COURSE')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${homeMode === 'COURSE' ? 'bg-white shadow text-duo-blue-dark' : 'text-duo-gray-dark'}`}
          >
            COURS COMPLET
          </button>
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-duo-gray-dark ml-2">Sujet</label>
            <div className="grid grid-cols-2 gap-2">
              {["React", "JavaScript", "TypeScript", "CSS", "Git", "Python"].map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3 rounded-xl border-2 font-bold text-sm transition-all
                                ${selectedTopic === topic
                      ? 'border-duo-blue bg-blue-50 text-duo-blue'
                      : 'border-duo-gray bg-white text-duo-gray-dark'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-duo-gray-dark ml-2">Difficulté</label>
            <div className="flex space-x-2">
              {Object.values(Difficulty).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 p-2 rounded-xl border-b-4 font-bold text-xs transition-all
                                ${selectedDifficulty === diff
                      ? 'bg-duo-yellow text-white border-duo-yellow-dark'
                      : 'bg-duo-gray text-duo-gray-dark border-duo-gray-dark opacity-50'
                    }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <Button fullWidth size="lg" onClick={startActivity} disabled={loading}>
          {loading ? loadingMessage : (homeMode === 'QUIZ' ? "LANCER LE QUIZ" : "GÉNÉRER LE COURS")}
        </Button>
      </div>
    </div>
  );

  const renderResult = () => {
    const isCourse = view === 'RESULT' && currentCourse?.isCompleted; // Simple check, usually one is active
    const score = currentQuiz?.score || 0;
    const total = currentQuiz?.questions.length || 0;
    const xpGained = isCourse ? 150 : (score * 10 + 20);

    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-6 text-center max-w-md mx-auto">
        <Mascot emotion="excited" className="mb-8" />
        <h2 className="text-3xl font-extrabold text-duo-yellow-dark mb-2">
          {isCourse ? "Cours terminé !" : "Leçon terminée !"}
        </h2>
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          {!isCourse && (
            <div className="bg-duo-yellow p-4 rounded-2xl border-b-4 border-duo-yellow-dark text-white">
              <div className="text-xs font-bold uppercase opacity-80">Score total</div>
              <div className="text-3xl font-extrabold">{score} / {total}</div>
            </div>
          )}
          <div className={`${isCourse ? 'col-span-2' : ''} bg-duo-blue p-4 rounded-2xl border-b-4 border-duo-blue-dark text-white`}>
            <div className="text-xs font-bold uppercase opacity-80">XP Gagné</div>
            <div className="text-3xl font-extrabold">+{xpGained}</div>
          </div>
        </div>
        <Button fullWidth size="lg" onClick={() => {
          setCurrentQuiz(null);
          setCurrentCourse(null);
          setView('HOME');
        }}>
          CONTINUER
        </Button>
      </div>
    );
  };

  return (
    <>
      {view === 'HOME' && renderHome()}
      {view === 'QUIZ' && currentQuiz && (
        <QuizComponent
          questions={currentQuiz.questions}
          onComplete={handleQuizComplete}
          onExit={() => setView('HOME')}
        />
      )}
      {view === 'COURSE' && currentCourse && (
        <CourseViewer
          course={currentCourse}
          onCourseComplete={handleCourseComplete}
          onExit={() => setView('HOME')}
        />
      )}
      {view === 'RESULT' && renderResult()}
    </>
  );
}