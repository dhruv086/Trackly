import React from 'react';

const Card = ({ children, className = '', padding = 'p-8', hover = true }) => {
  return (
    <div className={`
      bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-300
      ${hover ? 'hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1' : ''}
      ${padding}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
