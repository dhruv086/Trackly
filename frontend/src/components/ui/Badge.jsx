import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-widest rounded-lg border';

  const variants = {
    default: 'bg-slate-50 text-slate-500 border-slate-100',
    primary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    dark: 'bg-slate-900 text-white border-slate-800',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[8px]',
    sm: 'px-2.5 py-1 text-[9px]',
    md: 'px-3 py-1.5 text-[10px]',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
