import React from 'react';
import { useDailyProgress } from '../../hooks/useDailyProgress';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';

export function ProgressHeatmap() {
  const { progressData } = useDailyProgress();

  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const getActivityLevel = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayProgress = progressData.filter(entry => entry.date === dateString);
    
    if (dayProgress.length === 0) return 0;
    if (dayProgress.length <= 2) return 1;
    if (dayProgress.length <= 4) return 2;
    return 3;
  };

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-800/30';
      case 1: return 'bg-emerald-900/60';
      case 2: return 'bg-emerald-700/80';
      case 3: return 'bg-emerald-500';
      default: return 'bg-gray-800/30';
    }
  };

  const weeks = React.useMemo(() => {
    const weekGroups: Date[][] = [];
    let currentWeek: Date[] = [];
    
    allDays.forEach((day, index) => {
      if (index % 7 === 0 && currentWeek.length > 0) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }
    
    return weekGroups;
  }, [allDays]);

  const totalDays = progressData.length;
  const activeDays = progressData.filter(entry => 
    Object.values(entry.metrics).some(value => value && value > 0)
  ).length;

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Progress Heatmap</h3>
        <p className="text-sm text-gray-400">Your daily activity throughout {currentYear}</p>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => {
                const activityLevel = getActivityLevel(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getActivityColor(activityLevel)} ${
                      isToday ? 'ring-2 ring-cyan-400' : ''
                    } hover:scale-125 transition-transform duration-200 cursor-pointer`}
                    title={`${format(day, 'MMM d, yyyy')} - ${activityLevel > 0 ? `${activityLevel} platform${activityLevel > 1 ? 's' : ''}` : 'No activity'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend and Stats */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-800/30 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-900/60 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-700/80 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-white font-medium">{activeDays} active days</p>
          <p className="text-xs text-gray-400">{totalDays} total entries</p>
        </div>
      </div>
    </div>
  );
}