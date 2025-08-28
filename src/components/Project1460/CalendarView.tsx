import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { DailyProgress } from '../../types';

interface CalendarViewProps {
  currentDate: Date;
  dailyProgress: DailyProgress[];
  onDateSelect: (date: Date) => void;
}

export function CalendarView({ currentDate, dailyProgress, onDateSelect }: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getProgressForDate = (date: Date) => {
    return dailyProgress.find(p => isSameDay(new Date(p.date), date));
  };

  const getActivityLevel = (progress: DailyProgress | undefined) => {
    if (!progress) return 'bg-gray-800';
    
    const totalContent = progress.videos_posted + progress.shorts_posted + 
                        progress.reels_posted + progress.tiktoks_posted + 
                        progress.tweets_posted + progress.linkedin_posts + 
                        progress.blog_posts + progress.podcast_episodes;
    
    if (totalContent === 0) return 'bg-gray-700';
    if (totalContent <= 2) return 'bg-emerald-900';
    if (totalContent <= 5) return 'bg-emerald-700';
    return 'bg-emerald-500';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const progress = getProgressForDate(day);
          const activityLevel = getActivityLevel(progress);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
                hover:scale-110 hover:shadow-lg
                ${activityLevel}
                ${isToday(day) ? 'ring-2 ring-cyan-400' : ''}
                ${progress ? 'text-white' : 'text-gray-400'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}