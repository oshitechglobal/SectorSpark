import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ContentPiece } from '../../types';
import { ContentCard } from './ContentCard';
import { Plus } from 'lucide-react';

interface CalendarViewProps {
  currentDate: Date;
  content: ContentPiece[];
  onDateSelect: (date: Date) => void;
  onCreateContent: (date: Date) => void;
}

export function CalendarView({ currentDate, content, onDateSelect, onCreateContent }: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getContentForDate = (date: Date) => {
    return content.filter(item => 
      item.date && isSameDay(new Date(item.date), date)
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => {
          const dayContent = getContentForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={day.toString()}
              className={`min-h-[120px] p-2 rounded-xl border transition-all duration-200 ${
                isCurrentMonth 
                  ? 'bg-gray-900/50 border-gray-800/30' 
                  : 'bg-gray-900/20 border-gray-800/10'
              } ${
                isToday(day) ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isCurrentMonth ? 'text-white' : 'text-gray-500'
                } ${
                  isToday(day) ? 'text-cyan-400' : ''
                }`}>
                  {format(day, 'd')}
                </span>
                <button
                  onClick={() => onCreateContent(day)}
                  className="opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-gray-800/50 rounded"
                >
                  <Plus size={12} className="text-gray-400 hover:text-cyan-400" />
                </button>
              </div>
              
              <div className="space-y-1">
                {dayContent.slice(0, 2).map(item => (
                  <div
                    key={item.id}
                    onClick={() => onDateSelect(day)}
                    className="cursor-pointer"
                  >
                    <div className="text-xs p-1 rounded bg-gray-800/50 text-gray-300 truncate hover:bg-gray-700/50 transition-colors">
                      {item.title}
                    </div>
                  </div>
                ))}
                {dayContent.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayContent.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Content */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Content for {format(new Date(), 'MMMM d, yyyy')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getContentForDate(new Date()).map(item => (
            <ContentCard key={item.id} content={item} />
          ))}
          {getContentForDate(new Date()).length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No content scheduled for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}