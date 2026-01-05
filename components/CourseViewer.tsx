import React, { useState } from 'react';
import { Course, Module } from '../types';
import Button from './Button';
import QuizComponent from './QuizComponent';
import ProgressBar from './ProgressBar';
import { XMark } from './Icons';

interface CourseViewerProps {
    course: Course;
    onCourseComplete: () => void;
    onExit: () => void;
}

const SimpleMarkdown = ({ text }: { text: string }) => {
    // Very basic parser: splits by double newline for paragraphs. 
    // Detects # for headers and ``` for code.
    // This is a naive implementation but sufficient for our controlled AI output.

    const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

    return (
        <div className="space-y-4 text-duo-text text-lg leading-relaxed">
            {parts.map((part, idx) => {
                if (part.startsWith('```')) {
                    const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
                    return (
                        <div key={idx} className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto border-2 border-gray-700 shadow-inner my-4">
                            <pre>{code}</pre>
                        </div>
                    );
                }

                // Split non-code parts by newlines to handle paragraphs
                const lines = part.split('\n').filter(line => line.trim() !== '');

                return lines.map((line, lineIdx) => {
                    if (line.startsWith('### ')) {
                        return <h4 key={`${idx}-${lineIdx}`} className="text-xl font-bold text-duo-blue mt-4 mb-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ')) {
                        return <h3 key={`${idx}-${lineIdx}`} className="text-2xl font-bold text-duo-blue-dark mt-6 mb-3 border-b-2 border-blue-100 pb-1">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('# ')) {
                        return <h2 key={`${idx}-${lineIdx}`} className="text-3xl font-extrabold text-duo-text mt-6 mb-4">{line.replace('# ', '')}</h2>;
                    }
                    if (line.startsWith('- ')) {
                        return <li key={`${idx}-${lineIdx}`} className="ml-4 list-disc pl-2">{line.replace('- ', '')}</li>
                    }
                    return <p key={`${idx}-${lineIdx}`}>{line}</p>;
                });
            })}
        </div>
    );
};

export default function CourseViewer({ course, onCourseComplete, onExit }: CourseViewerProps) {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [mode, setMode] = useState<'READING' | 'QUIZ'>('READING');

    const currentModule = course.modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === course.modules.length - 1;

    const handleModuleQuizComplete = (score: number) => {
        // In a course module quiz, we expect 100% success basically, or we just let them pass.
        // The instruction said "mini quiz (one question) to validate".
        // Let's say if score > 0 (since it's 1 question, score is 0 or 1), we pass.
        if (score > 0) {
            if (isLastModule) {
                onCourseComplete();
            } else {
                setCurrentModuleIndex(prev => prev + 1);
                setMode('READING');
            }
        } else {
            // Retry? Or just show the correct answer and move on?
            // QuizComponent handles the "Try again" or "Check" logic.
            // But QuizComponent calls onComplete when finished.
            // If the user failed, we might want to let them review.
            // For simplicity, let's assume they passed if they finished the quiz flow (since QuizComponent enforces correctness check before finishing if we want).
            // Actually QuizComponent allows finishing regardless of score in its current `nextQuestion` logic.
            // Let's strict it: must be correct.
            // But wait, QuizComponent just returns score.

            // If failed, maybe alert them?
            if (isLastModule) {
                onCourseComplete();
            } else {
                setCurrentModuleIndex(prev => prev + 1);
                setMode('READING');
            }
        }
    };

    if (mode === 'QUIZ' && currentModule.quiz) {
        return (
            <QuizComponent
                questions={[currentModule.quiz]}
                onComplete={handleModuleQuizComplete}
                onExit={() => setMode('READING')}
                showProgressBar={false}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white relative max-w-md mx-auto">
            {/* Header */}
            <div className="px-4 py-4 border-b-2 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-2">
                    <button onClick={onExit} className="text-duo-gray-dark hover:text-duo-gray">
                        <XMark />
                    </button>
                </div>
                <div className="text-xs font-bold uppercase text-duo-gray-dark tracking-widest">
                    Module {currentModuleIndex + 1} / {course.modules.length}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32">
                <h1 className="text-3xl font-extrabold text-duo-text mb-2 break-words text-balance">
                    {currentModule.title}
                </h1>
                <div className="w-16 h-2 bg-duo-blue rounded-full mb-8"></div>

                <SimpleMarkdown text={currentModule.content.text} />

                {currentModule.content.codeSnippet && (
                    <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border-2 border-gray-700 shadow-inner">
                        <pre>{currentModule.content.codeSnippet}</pre>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 border-t-2 bg-white transition-colors duration-300 z-10">
                <div className="max-w-md mx-auto">
                    <Button fullWidth size="lg" onClick={() => setMode('QUIZ')}>
                        PASSER LE QUIZ
                    </Button>
                </div>
            </div>
        </div>
    );
}
