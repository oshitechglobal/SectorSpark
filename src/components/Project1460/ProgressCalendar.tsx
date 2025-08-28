import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarDay, DailyProgressEntry, PlatformType } from '../../types/progress';
import { Check, X, Minus } from 'lucide-react';

interface ProgressCalendarProps {
  currentDate: Date;
  progressData: DailyProgressEntry[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function ProgressCalendar({ currentDate, progressData, onDateSelect, selectedDate }: ProgressCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getCalendarDay = (date: Date): CalendarDay => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayProgress = progressData.filter(entry => entry.date === dateString);
    
    const platforms = dayProgress.map(entry => entry.platform);
    const hasData = dayProgress.length > 0;
    
    let completionStatus: 'complete' | 'partial' | 'empty' = 'empty';
    if (hasData) {
      // Consider complete if at least 4 platforms have data
      completionStatus = platforms.length >= 4 ? 'complete' : 'partial';
    }

    return {
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isToday: isToday(date),
      hasData,
      completionStatus,
      platforms,
    };
  };

  const getStatusIcon = (status: 'complete' | 'partial' | 'empty') => {
    switch (status) {
      case 'complete':
        return <Check size={12} className="text-emerald-400" />;
      case 'partial':
        return <Minus size={12} className="text-yellow-400" />;
      default:
        return <X size={12} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'complete' | 'partial' | 'empty') => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30';
      case 'partial':
        return 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30';
      default:
        return 'bg-gray-800/20 border-gray-700/30 hover:bg-gray-700/30';
    }
  };

  const platformColors: Record<PlatformType, string> = {
    youtube: 'bg-red-500',
    skool: 'bg-purple-500',
    linkedin: 'bg-blue-600',
    instagram: 'bg-pink-500',
    twitter: 'bg-blue-400',
    email: 'bg-green-500',
  };

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <p className="text-sm text-gray-400">
          Click on any day to view or edit your progress
        </p>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map(day => {
          const calendarDay = getCalendarDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                relative aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
                border-2 hover:scale-105
                ${calendarDay.isCurrentMonth ? 'text-white' : 'text-gray-500'}
                ${calendarDay.isToday ? 'ring-2 ring-cyan-400' : ''}
                ${isSelected ? 'ring-2 ring-violet-400' : ''}
                ${getStatusColor(calendarDay.completionStatus)}
              `}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">{format(day, 'd')}</span>
                {getStatusIcon(calendarDay.completionStatus)}
              </div>
              
              {/* Platform Indicators */}
              {calendarDay.hasData && (
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {calendarDay.platforms.slice(0, 4).map((platform, index) => (
                    <div
                      key={`${platform}-${index}`}
                      className={`w-1.5 h-1.5 rounded-full ${platformColors[platform]}`}
                      title={platform}
                    />
                  ))}
                  {calendarDay.platforms.length > 4 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${calendarDay.platforms.length - 4} more`} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Check size={12} className="text-emerald-400" />
            <span>Complete (4+ platforms)</span>
          </div>
          <div className="flex items-center space-x-1">
            <Minus size={12} className="text-yellow-400" />
            <span>Partial</span>
          </div>
          <div className="flex items-center space-x-1">
            <X size={12} className="text-gray-500" />
            <span>No data</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Platforms:</span>
          {Object.entries(platformColors).map(([platform, color]) => (
            <div key={platform} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="capitalize">{platform}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}