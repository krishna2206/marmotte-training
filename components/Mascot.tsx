import React from 'react';

interface MascotProps {
  emotion?: 'happy' | 'thinking' | 'sad' | 'excited';
  className?: string;
}

const Mascot: React.FC<MascotProps> = ({ emotion = 'happy', className = 'w-32 h-32' }) => {
  // Simple emoji composition for the "Marmotte" character to keep it lightweight but expressive

  const getEmoji = () => {
    switch (emotion) {
      case 'happy': return '🦦';
      case 'excited': return '🤩';
      case 'thinking': return '🤔';
      case 'sad': return '😢';
      default: return '🦦';
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center animate-bounce-short ${className}`}>
      <div className="text-[100px] leading-none filter drop-shadow-lg">
        {getEmoji()}
      </div>
    </div>
  );
};

export default Mascot;