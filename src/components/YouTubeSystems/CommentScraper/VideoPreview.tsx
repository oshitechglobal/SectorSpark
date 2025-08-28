import React from 'react';
import { Play } from 'lucide-react';

interface VideoPreviewProps {
  currentVideoId: string;
}

export function VideoPreview({ currentVideoId }: VideoPreviewProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Video Preview</h3>
      {currentVideoId ? (
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-800">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <Play size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Enter a YouTube URL to preview the video</p>
          </div>
        </div>
      )}
    </div>
  );
}