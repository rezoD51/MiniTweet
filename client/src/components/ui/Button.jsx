import React from 'react';

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out';

  const variantStyles = {
    primary: 'bg-twitter-blue text-white hover:bg-blue-500 focus:ring-blue-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    outline: 'bg-transparent text-twitter-blue border border-twitter-blue hover:bg-blue-50 focus:ring-blue-300',
    'outline-gray': 'bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-100 focus:ring-gray-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${ (disabled || loading) ? disabledStyles : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className={`animate-spin h-5 w-5 ${variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-twitter-blue'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;