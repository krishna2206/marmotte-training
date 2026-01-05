import React, { useState } from 'react';
import { Question } from '../types';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { Check, XMark } from './Icons';

interface QuizComponentProps {
    questions: Question[];
    onComplete: (score: number) => void;
    onExit: () => void;
    showProgressBar?: boolean;
}

export default function QuizComponent({ questions, onComplete, onExit, showProgressBar = true }: QuizComponentProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentQuestionIndex];
    const total = questions.length;

    const checkAnswer = () => {
        if (selectedOption === null) return;
        const correct = selectedOption === currentQuestion.correctAnswerIndex;
        setIsCorrect(correct);
        setIsAnswerChecked(true);
        if (correct) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < total - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
        } else {
            // Final calculation adjustment if needed, but score is already updated
            onComplete(score + (isCorrect ? 0 : 0));
        }
    };

    const footerBg = isAnswerChecked
        ? (isCorrect ? 'bg-duo-green-light' : 'bg-duo-red-light')
        : 'bg-white';

    const footerTextColor = isCorrect ? 'text-duo-green-dark' : 'text-duo-red-dark';
    const footerIconBg = isCorrect ? 'bg-duo-green' : 'bg-duo-red';

    return (
        <div className="flex flex-col h-full relative max-w-md mx-auto bg-white">
            <div className="px-4 py-6 flex items-center space-x-4">
                <button onClick={onExit} className="text-duo-gray-dark hover:text-duo-gray">
                    <XMark />
                </button>
                {showProgressBar && <ProgressBar current={currentQuestionIndex + 1} total={total} />}
            </div>

            <div className="flex-1 px-4 overflow-y-auto pb-48">
                <h2 className="text-2xl font-bold text-duo-text mb-6">
                    {currentQuestion.text}
                </h2>

                {currentQuestion.codeSnippet && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto border-2 border-gray-700 shadow-inner">
                        <pre>{currentQuestion.codeSnippet}</pre>
                    </div>
                )}

                <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectAnswer = idx === currentQuestion.correctAnswerIndex;
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
                                        La bonne réponse était : {currentQuestion.options[currentQuestion.correctAnswerIndex]}
                                    </p>
                                )}
                                <p className={`text-xs mt-1 italic font-medium ${footerTextColor} opacity-80`}>
                                    💡 {currentQuestion.explanation}
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
}
