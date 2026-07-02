import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-sm font-mono text-slate-500 animate-pulse">
        MENGALIHKAN KE DASHBOARD...
      </div>
    </div>
  );
};
