import React from 'react';
import { Clock, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import { CommentScraping, useCommentScraping } from '../../../hooks/useCommentScraping';

interface ScrapingHistoryProps {
  scrapings: CommentScraping[];
  selectedScraping: CommentScraping | null;
  onSelectScraping: (scraping: CommentScraping) => void;
  onDeleteScraping: (id: string) => void;
}

export function ScrapingHistory({
  scrapings,
  selectedScraping,
  onSelectScraping,
  onDeleteScraping
}: ScrapingHistoryProps) {
  const { getTotalComments } = useCommentScraping();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Scraping History</h3>
        {scrapings.length > 0 && (
          <span className="text-sm text-gray-400">
            {scrapings.length} scraping{scrapings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {scrapings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Scraping History</h4>
          <p className="text-gray-400">
            Your scraped videos will appear here for easy access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scrapings.map((scraping) => (
            <div
              key={scraping.id}
              onClick={() => onSelectScraping(scraping)}
              className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                selectedScraping?.id === scraping.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={scraping.video_thumbnail || `https://img.youtube.com/vi/${scraping.video_id}/maxresdefault.jpg`}
                    alt={scraping.video_title}
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://img.youtube.com/vi/${scraping.video_id}/hqdefault.jpg`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                      {scraping.video_title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <MessageSquare size={12} />
                      <span>{scraping.comment_count} requested</span>
                      <Clock size={12} />
                      <span>{new Date(scraping.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        scraping.status === 'completed' ? 'bg-emerald-400' :
                        scraping.status === 'pending' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      <span className="text-xs text-gray-400 capitalize">{scraping.status}</span>
                      {scraping.status === 'completed' && (
                        <>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-emerald-400">{getTotalComments(scraping)} categorized</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteScraping(scraping.id);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} />
              </button>

              {/* Status Indicator */}
              {scraping.status === 'pending' && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-cyan-400">Processing...</p>
                  </div>
                </div>
              )}

              {scraping.status === 'completed' && (
                <div className="absolute top-2 left-2 p-1 bg-emerald-500/20 rounded-lg">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}