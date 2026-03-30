import React from 'react';

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const sizes = {
    sm: 'w-8 h-8 text-[10px] rounded-xl',
    md: 'w-10 h-10 text-xs rounded-2xl',
    lg: 'w-16 h-16 text-xl rounded-[2rem]',
    xl: 'w-32 h-32 text-3xl rounded-[2.5rem]',
  };

  return (
    <div className={`
      ${sizes[size]} 
      bg-gradient-to-tr from-indigo-500 to-purple-500 
      flex items-center justify-center text-white font-black shadow-lg
      border-2 border-white
      overflow-hidden
      ${className}
    `}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;
