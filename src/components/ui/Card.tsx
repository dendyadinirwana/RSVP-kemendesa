import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded p-6 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-400' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
