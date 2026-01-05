import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateQuizQuestions } from './services/geminiService';
import { Question, Quiz, UserState, AppView, Difficulty } from './types';
import Button from './components/Button';
import ProgressBar from './components/ProgressBar';
import Mascot from './components/Mascot';
import XPCounter from './components/XPCounter';

// -- Icons --
const Check = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XMark = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function App() {
  // -- State --
  const [view, setView] = useState<AppView>('HOME');
  const [user, setUser] = useState<UserState>({
    name: 'Marmotte',
    xp: 0,
    streak: 0,
    completedQuizzes: [],
    lastLogin: Date.now()
  });

  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [selectedTopic, setSelectedTopic] = useState("React");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);

  useEffect(() => {
    const savedUser = localStorage.getItem('devmarmotte_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('devmarmotte_user', JSON.stringify(user));
  }, [user]);

  const startQuiz = async () => {
    setLoading(true);
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
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setLoading(false);
    setView('QUIZ');
  };

  const checkAnswer = () => {
    if (selectedOption === null || !currentQuiz) return;
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const correct = selectedOption === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;
    if (isCorrect) {
       currentQuiz.score = (currentQuiz.score || 0) + 1;
    }
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;
    const xpGained = (currentQuiz.score || 0) * 10 + 20; 
    const updatedUser = {
        ...user,
        xp: user.xp + xpGained,
        completedQuizzes: [...user.completedQuizzes, currentQuiz],
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

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <Mascot emotion="happy" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-duo-text">Salut, Marmotte ! 🦦</h2>
          <p className="text-duo-gray-dark font-medium">Prête à coder aujourd'hui ?</p>
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
        <Button fullWidth size="lg" onClick={startQuiz} disabled={loading}>
          {loading ? "Génération par IA..." : "C'EST PARTI !"}
        </Button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!currentQuiz) return null;
    const question = currentQuiz.questions[currentQuestionIndex];
    const total = currentQuiz.questions.length;

    const footerBg = isAnswerChecked 
        ? (isCorrect ? 'bg-duo-green-light' : 'bg-duo-red-light') 
        : 'bg-white';

    const footerTextColor = isCorrect ? 'text-duo-green-dark' : 'text-duo-red-dark';
    const footerIconBg = isCorrect ? 'bg-duo-green' : 'bg-duo-red';

    return (
      <div className="flex flex-col h-full relative max-w-md mx-auto bg-white">
        <div className="px-4 py-6 flex items-center space-x-4">
          <button onClick={() => setView('HOME')} className="text-duo-gray-dark hover:text-duo-gray">
             <XMark />
          </button>
          <ProgressBar current={currentQuestionIndex + 1} total={total} />
        </div>

        <div className="flex-1 px-4 overflow-y-auto pb-48">
          <h2 className="text-2xl font-bold text-duo-text mb-6">
            {question.text}
          </h2>

          {question.codeSnippet && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto border-2 border-gray-700 shadow-inner">
               <pre>{question.codeSnippet}</pre>
            </div>
          )}

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === question.correctAnswerIndex;
              let style = "bg-white border-duo-gray text-duo-text"; 
              if (isAnswerChecked) {
                 if (isCorrectAnswer) style = "bg-green-100 border-duo-green text-duo-green-dark";
                 else if (isSelected && !isCorrectAnswer) style = "bg-red-100 border-duo-red text-duo-red-dark";
                 else style = "opacity-50 border-duo-gray";
              } else if (isSelected) {
                 style = "bg-blue-50 border-duo-blue text-duo-blue";
              }
              return (
                <div 
                    key={idx}
                    onClick={() => !isAnswerChecked && setSelectedOption(idx)}
                    className={`p-4 rounded-2xl border-2 border-b-4 cursor-pointer font-semibold text-lg flex items-center space-x-3 transition-all ${style} ${!isAnswerChecked && 'hover:bg-gray-50 active:scale-95'}`}
                >
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold ${isSelected || (isAnswerChecked && isCorrectAnswer) ? 'border-current' : 'border-duo-gray-dark text-duo-gray-dark'}`}>
                        {idx + 1}
                    </div>
                    <span>{option}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-6 border-t-2 ${footerBg} transition-colors duration-300 z-10`}>
           <div className="max-w-md mx-auto">
              {isAnswerChecked && (
                  <div className="mb-6 flex items-start space-x-4 animate-pop">
                      <div className={`p-3 rounded-full ${footerIconBg} text-white shadow-lg`}>
                          {isCorrect ? <Check /> : <XMark />}
                      </div>
                      <div className="flex-1">
                          <h3 className={`text-xl font-bold ${footerTextColor}`}>
                              {isCorrect ? "Excellent !" : "Oups !"}
                          </h3>
                          {!isCorrect && (
                            <p className={`text-sm font-bold ${footerTextColor} opacity-90`}>
                              La bonne réponse était : {question.options[question.correctAnswerIndex]}
                            </p>
                          )}
                          {/* L'explication s'affiche désormais dans les deux cas (Vrai/Faux) */}
                          <p className={`text-xs mt-1 italic font-medium ${footerTextColor} opacity-80`}>
                              💡 {question.explanation}
                          </p>
                      </div>
                  </div>
              )}
              
              <Button 
                fullWidth 
                size="lg" 
                variant={isAnswerChecked ? (isCorrect ? 'success' : 'danger') : 'success'}
                disabled={selectedOption === null && !isAnswerChecked}
                onClick={isAnswerChecked ? nextQuestion : checkAnswer}
              >
                  {isAnswerChecked ? (currentQuestionIndex === total - 1 ? "VOIR LE RÉSULTAT" : "CONTINUER") : "VÉRIFIER"}
              </Button>
           </div>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="flex flex-col h-full bg-white items-center justify-center p-6 text-center max-w-md mx-auto">
        <Mascot emotion="excited" className="mb-8" />
        <h2 className="text-3xl font-extrabold text-duo-yellow-dark mb-2">Leçon terminée !</h2>
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-duo-yellow p-4 rounded-2xl border-b-4 border-duo-yellow-dark text-white">
                <div className="text-xs font-bold uppercase opacity-80">Score total</div>
                <div className="text-3xl font-extrabold">{currentQuiz?.score} / {currentQuiz?.questions.length}</div>
            </div>
             <div className="bg-duo-blue p-4 rounded-2xl border-b-4 border-duo-blue-dark text-white">
                <div className="text-xs font-bold uppercase opacity-80">XP Gagné</div>
                <div className="text-3xl font-extrabold">+{((currentQuiz?.score || 0) * 10) + 20}</div>
            </div>
        </div>
        <Button fullWidth size="lg" onClick={() => setView('HOME')}>
            CONTINUER
        </Button>
    </div>
  );

  return (
    <>
      {view === 'HOME' && renderHome()}
      {view === 'QUIZ' && renderQuiz()}
      {view === 'RESULT' && renderResult()}
    </>
  );
}