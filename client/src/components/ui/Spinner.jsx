import React from 'react';

function Spinner({ size = 'md', color = 'text-twitter-blue' }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${color} border-opacity-50`}></div>
  );
}

export default Spinner;