import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full h-4 bg-duo-gray rounded-full overflow-hidden relative">
        {/* Shine effect container */}
      <div 
        className="h-full bg-duo-green transition-all duration-500 ease-out rounded-full relative"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute top-1 right-2 w-full h-[3px] bg-white opacity-20 rounded-full"></div>
      </div>
    </div>
  );
};

export default ProgressBar;