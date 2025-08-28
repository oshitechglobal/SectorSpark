import React from 'react';
import { MessageSquare } from 'lucide-react';

interface VideoInputProps {
  videoUrl: string;
  commentCount: number;
  currentVideoId: string;
  error: string;
  isSubmitting: boolean;
  onUrlChange: (url: string) => void;
  onCommentCountChange: (count: number) => void;
  onSubmit: () => void;
}

export function VideoInput({
  videoUrl,
  commentCount,
  currentVideoId,
  error,
  isSubmitting,
  onUrlChange,
  onCommentCountChange,
  onSubmit
}: VideoInputProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Video URL & Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Comments to Scrape
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={commentCount}
            onChange={(e) => onCommentCountChange(parseInt(e.target.value) || 100)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum 1000 comments</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={isSubmitting || !currentVideoId}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <MessageSquare size={18} />
              <span>Submit Request</span>
            </>
          )}
        </button>

        {isSubmitting && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-cyan-400 text-sm">
              ✅ Request submitted! It will take 1 to 5 minutes to process. Check back in 5 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}