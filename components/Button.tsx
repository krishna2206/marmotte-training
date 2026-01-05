import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  fullWidth = false, 
  disabled = false,
  className = '',
  size = 'md'
}) => {
  
  const baseStyles = "font-bold uppercase tracking-widest transition-all transform active:translate-y-1 active:border-b-0 rounded-2xl flex items-center justify-center select-none";
  
  const variants = {
    primary: "bg-duo-blue text-white border-b-4 border-duo-blue-dark hover:bg-opacity-90 active:bg-duo-blue-dark",
    secondary: "bg-duo-yellow text-white border-b-4 border-duo-yellow-dark active:bg-duo-yellow-dark",
    success: "bg-duo-green text-white border-b-4 border-duo-green-dark active:bg-duo-green-dark",
    danger: "bg-duo-red text-white border-b-4 border-duo-red-dark active:bg-duo-red-dark",
    outline: "bg-transparent text-duo-blue border-2 border-b-4 border-duo-gray hover:bg-gray-50 active:border-b-2",
    ghost: "bg-transparent text-duo-gray-dark border-none hover:bg-gray-100 uppercase font-bold tracking-wider",
  };

  const disabledStyles = "bg-duo-gray text-duo-gray-dark border-b-4 border-duo-gray-dark cursor-not-allowed active:translate-y-0 active:border-b-4";

  const sizes = {
    sm: "py-2 px-4 text-xs border-b-2",
    md: "py-3 px-6 text-sm",
    lg: "py-4 px-8 text-lg"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseStyles} 
        ${disabled ? disabledStyles : variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;