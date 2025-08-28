import React, { useState } from 'react';
import { DailyProgressEntry, PlatformType } from '../../types/progress';
import { format } from 'date-fns';
import { Check, X, Minus, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgressHistoryTableProps {
  progressData: DailyProgressEntry[];
}

const ITEMS_PER_PAGE = 10;

export function ProgressHistoryTable({ progressData }: ProgressHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Group data by date
  const groupedData = progressData.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = {};
    }
    acc[entry.date][entry.platform] = entry;
    return acc;
  }, {} as Record<string, Record<PlatformType, DailyProgressEntry>>);

  // Sort dates
  const sortedDates = Object.keys(groupedData).sort((a, b) => {
    return sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b);
  });

  // Pagination
  const totalPages = Math.ceil(sortedDates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDates = sortedDates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const platforms: PlatformType[] = ['youtube', 'skool', 'linkedin', 'instagram', 'twitter', 'email'];

  const getStatusIcon = (entry?: DailyProgressEntry) => {
    if (!entry) return <X size={16} className="text-gray-500" />;
    
    // Check if entry has meaningful data
    const hasData = Object.values(entry.metrics).some(value => value && value > 0);
    
    if (hasData) {
      return <Check size={16} className="text-emerald-400" />;
    } else {
      return <Minus size={16} className="text-yellow-400" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', ...platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1))];
    const rows = sortedDates.map(date => {
      const row = [date];
      platforms.forEach(platform => {
        const entry = groupedData[date][platform];
        if (entry) {
          const metrics = Object.values(entry.metrics).filter(v => v && v > 0);
          row.push(metrics.length > 0 ? 'Complete' : 'Partial');
        } else {
          row.push('Missing');
        }
      });
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Progress History</h3>
          <p className="text-sm text-gray-400">
            Detailed view of your daily completion status across all platforms
          </p>
        </div>
        
        <button
          onClick={exportToCSV}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {paginatedDates.length > 0 ? (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/30">
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={toggleSortOrder}
                      className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                    >
                      <span>Date</span>
                      <span className="text-xs">
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    </button>
                  </th>
                  {platforms.map(platform => (
                    <th key={platform} className="text-center py-3 px-2 text-gray-300 capitalize">
                      {platform}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedDates.map(date => (
                  <tr key={date} className="border-b border-gray-800/10 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">
                      {format(new Date(date), 'MMM d, yyyy')}
                    </td>
                    {platforms.map(platform => (
                      <td key={platform} className="text-center py-3 px-2">
                        {getStatusIcon(groupedData[date][platform])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-400">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedDates.length)} of {sortedDates.length} entries
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Check size={16} className="text-emerald-400" />
              <span>Complete</span>
            </div>
            <div className="flex items-center space-x-1">
              <Minus size={16} className="text-yellow-400" />
              <span>Partial</span>
            </div>
            <div className="flex items-center space-x-1">
              <X size={16} className="text-gray-500" />
              <span>Missing</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No History Yet</h4>
          <p className="text-gray-400">
            Start tracking your daily progress to build your history.
          </p>
        </div>
      )}
    </div>
  );
}