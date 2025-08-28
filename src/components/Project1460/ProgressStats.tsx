import React from 'react';
import { ProgressStats as ProgressStatsType } from '../../types/progress';
import { Target, TrendingUp, Calendar, Award, Flame, CheckCircle } from 'lucide-react';

interface ProgressStatsProps {
  stats: ProgressStatsType;
}

export function ProgressStats({ stats }: ProgressStatsProps) {
  const CircularProgress = ({ 
    value, 
    max = 100, 
    size = 80, 
    strokeWidth = 6, 
    color = '#06b6d4' 
  }: {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{Math.round(value)}{max === 100 ? '%' : ''}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Completion Rate */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Target size={24} className="text-emerald-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-300">Completion Rate</h3>
        </div>
        <CircularProgress 
          value={stats.completionRate} 
          color="#10b981"
        />
        <p className="text-xs text-gray-400 mt-2">
          {stats.completedDays} of {stats.totalDays} days
        </p>
      </div>

      {/* Current Streak */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Flame size={24} className="text-orange-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-300">Current Streak</h3>
        </div>
        <div className="text-3xl font-bold text-gradient mb-2">
          {stats.currentStreak}
        </div>
        <p className="text-xs text-gray-400">
          {stats.currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
      </div>

      {/* Longest Streak */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Award size={24} className="text-violet-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-300">Best Streak</h3>
        </div>
        <div className="text-3xl font-bold text-gradient mb-2">
          {stats.longestStreak}
        </div>
        <p className="text-xs text-gray-400">
          personal record
        </p>
      </div>

      {/* Total Days Tracked */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Calendar size={24} className="text-cyan-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-300">Days Tracked</h3>
        </div>
        <div className="text-3xl font-bold text-gradient mb-2">
          {stats.totalDays}
        </div>
        <p className="text-xs text-gray-400">
          total entries
        </p>
      </div>

      {/* Completed Days */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle size={24} className="text-emerald-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-300">Complete Days</h3>
        </div>
        <div className="text-3xl font-bold text-gradient mb-2">
          {stats.completedDays}
        </div>
        <p className="text-xs text-gray-400">
          4+ platforms tracked
        </p>
      </div>

      {/* Progress to 1460 */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp size={24} className="text-rose-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-300">Progress to 1460</h3>
        </div>
        <CircularProgress 
          value={stats.totalDays} 
          max={1460}
          color="#f43f5e"
        />
        <p className="text-xs text-gray-400 mt-2">
          {1460 - stats.totalDays} days remaining
        </p>
      </div>
    </div>
  );
}