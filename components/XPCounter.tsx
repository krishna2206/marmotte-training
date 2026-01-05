import React from 'react';

interface XPCounterProps {
  xp: number;
  streak: number;
}

const XPCounter: React.FC<XPCounterProps> = ({ xp, streak }) => {
  return (
    <div className="flex space-x-4">
      <div className="flex items-center space-x-1">
        <span className="text-2xl">🔥</span>
        <span className="font-bold text-duo-yellow-dark">{streak}</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-xl">💎</span>
        <span className="font-bold text-duo-blue">{xp} XP</span>
      </div>
    </div>
  );
};

export default XPCounter;