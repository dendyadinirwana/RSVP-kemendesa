import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'primary' | 'purple' | 'cyan';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold font-mono tracking-wide uppercase';

  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    primary: 'bg-slate-900 text-white border border-slate-900',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
