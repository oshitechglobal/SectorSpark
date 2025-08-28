import React from 'react';

interface InfinityLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function InfinityLogo({ size = 'md', animated = true }: InfinityLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        viewBox="0 0 100 50"
        className={`w-full h-full text-gradient fill-current ${
          animated ? 'animate-pulse-slow' : ''
        }`}
      >
        <path
          d="M15 25 C 15 15, 25 15, 25 25 C 25 35, 35 35, 35 25 C 35 15, 45 15, 45 25 C 45 35, 55 35, 55 25 C 55 15, 65 15, 65 25 C 65 35, 75 35, 75 25 C 75 15, 85 15, 85 25"
          fill="none"
          stroke="url(#infinityGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="33%" stopColor="#8b5cf6" />
            <stop offset="66%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-rose-500 rounded-full blur-xl opacity-20 animate-pulse-slow" />
      )}
    </div>
  );
}