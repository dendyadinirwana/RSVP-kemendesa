import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-xs ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-3.5 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};
