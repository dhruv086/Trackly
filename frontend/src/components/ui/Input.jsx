import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={inputType}
          className={`
            w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm 
            transition-all duration-200 outline-none
            focus:ring-4 focus:ring-indigo-500/10 focus:bg-white
            ${error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs font-semibold text-rose-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
