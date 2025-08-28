import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Play, Copy, FileText, Clock, RefreshCw, Trash2, AlertCircle, Download } from 'lucide-react';
import { useYouTubeChapters, YouTubeChapters } from '../../hooks/useYouTubeChapters';
import { useAuth } from '../../hooks/useAuth';

interface ChaptersGeneratorProps {
  onBack: () => void;
}

export function ChaptersGenerator({ onBack }: ChaptersGeneratorProps) {
  const { user } = useAuth();
  const {
    chapters,
    loading,
    error: hookError,
    createChapters,
    updateChapters,
    deleteChapters,
    getChaptersByVideoId,
    completeChapters,
    failChapters,
    refetch
  } = useYouTubeChapters();

  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<YouTubeChapters | null>(null);
  const [error, setError] = useState('');
  const [copiedType, setCopiedType] = useState<'text' | 'description' | null>(null);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Get video metadata from YouTube oEmbed API
  const getVideoMetadata = async (videoId: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title,
          thumbnail: data.thumbnail_url,
          author: data.author_name
        };
      }
    } catch (err) {
      console.error('Failed to fetch video metadata:', err);
    }
    return {
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      author: 'Unknown'
    };
  };

  // Handle URL input change and auto-embed
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    setError('');
    
    if (url.trim()) {
      const videoId = extractVideoId(url);
      if (videoId) {
        setCurrentVideoId(videoId);
        
        // Check if this video has already been processed
        const existingChapters = getChaptersByVideoId(videoId);
        if (existingChapters) {
          setSelectedChapters(existingChapters);
        }
      } else {
        setCurrentVideoId('');
      }
    } else {
      setCurrentVideoId('');
    }
  };

  // Send URL to webhook and start generation
  const handleGenerate = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Please enter a valid YouTube video URL');
      return;
    }

    // Check if this video has already been processed
    const existingChapters = getChaptersByVideoId(videoId);
    if (existingChapters) {
      setSelectedChapters(existingChapters);
      setError('This video has already been processed. Select it from the history below.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Get video metadata
      const metadata = await getVideoMetadata(videoId);
      
      // Create new chapters entry in database
      const newChapters = await createChapters({
        video_url: videoUrl,
        video_id: videoId,
        video_title: metadata.title,
        video_thumbnail: metadata.thumbnail,
      });

      setSelectedChapters(newChapters);

      // Send to webhook
      const webhookResponse = await fetch('https://hook.us1.make.com/bm7bfde0l2csu3w44g1d8mir4nly66t1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          videoId,
          chaptersId: newChapters.id,
          timestamp: new Date().toISOString(),
          userId: user.id, // Include user ID for Make.com
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status}`);
      }

      console.log('Chapter generation request sent to webhook successfully');

    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to start chapter generation. Please try again.');
      setIsGenerating(false);
      
      // Mark generation as failed if it was created
      if (selectedChapters) {
        await failChapters(selectedChapters.id, err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  // Copy chapters content
  const copyContent = async (type: 'text' | 'description') => {
    if (!selectedChapters?.chapters_text) return;

    try {
      let content = selectedChapters.chapters_text;
      
      if (type === 'description') {
        // Format for YouTube description
        content = `Chapters:\n${content}`;
      }

      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  // Download chapters as text file
  const downloadChapters = () => {
    if (!selectedChapters?.chapters_text) return;
    
    const content = `${selectedChapters.video_title}\n\nChapters:\n${selectedChapters.chapters_text}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedChapters.video_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chapters.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete chapters from database
  const handleDeleteChapters = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter generation?')) return;
    
    try {
      await deleteChapters(id);
      if (selectedChapters?.id === id) {
        setSelectedChapters(null);
      }
    } catch (err) {
      console.error('Failed to delete chapters:', err);
    }
  };

  // Select chapters from history
  const selectChapters = (chaptersItem: YouTubeChapters) => {
    setSelectedChapters(chaptersItem);
    setVideoUrl(chaptersItem.video_url);
    setCurrentVideoId(chaptersItem.video_id);
    setError('');
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh chapters:', err);
    }
  };

  // Listen for real-time updates to stop generating when completed
  useEffect(() => {
    if (selectedChapters && selectedChapters.status === 'completed' && isGenerating) {
      setIsGenerating(false);
    }
    if (selectedChapters && selectedChapters.status === 'failed' && isGenerating) {
      setIsGenerating(false);
      setError('Chapter generation failed. Please try again.');
    }
  }, [selectedChapters, isGenerating]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your chapter generations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Tools</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">YouTube Chapters Generator</h1>
            <p className="text-gray-400">Generate AI-powered timestamps and chapters for better video navigation</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Display */}
      {hookError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400">{hookError}</p>
          </div>
        </div>
      )}

      {/* Main Generation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URL Input Column */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Video URL</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !currentVideoId}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Generate Chapters</span>
                </>
              )}
            </button>

            {isGenerating && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                <p className="text-cyan-400 text-sm">
                  ✅ Request submitted! AI is analyzing your video to generate chapters. This may take 1-3 minutes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Video Embed Column */}
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
      </div>

      {/* Chapter Results */}
      {selectedChapters && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Generated Chapters</h3>
            {selectedChapters.status === 'completed' && selectedChapters.chapters_text && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyContent('text')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FileText size={16} />
                  <span>{copiedType === 'text' ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => copyContent('description')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedType === 'description' ? 'Copied!' : 'Copy for Description'}</span>
                </button>
                <button
                  onClick={downloadChapters}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {selectedChapters.status === 'pending' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white mb-2">Generating Chapters</h4>
              <p className="text-gray-400">
                Our AI is analyzing your video content to create meaningful chapters. This may take a few moments...
              </p>
            </div>
          )}

          {selectedChapters.status === 'failed' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Generation Failed</h4>
              <p className="text-gray-400 mb-4">
                Something went wrong during chapter generation. Please try again.
              </p>
              <button onClick={handleGenerate} className="btn-primary">
                Retry Generation
              </button>
            </div>
          )}

          {selectedChapters.status === 'completed' && selectedChapters.chapters_text && (
            <div className="space-y-6">
              {/* Video Info */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">{selectedChapters.video_title}</h4>
                <p className="text-gray-400 text-sm">Generated on {new Date(selectedChapters.created_at).toLocaleDateString()}</p>
              </div>

              {/* Chapters Display */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                  <Clock size={18} className="text-cyan-400" />
                  <span>Generated Chapters</span>
                </h4>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {selectedChapters.chapters_text}
                  </pre>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-xl p-6 border border-cyan-500/20">
                <h4 className="text-white font-medium mb-3">How to Use These Chapters</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Copy the chapters text and paste it into your YouTube video description</p>
                  <p>• YouTube will automatically convert timestamps into clickable chapters</p>
                  <p>• Make sure your first chapter starts at 0:00 for best results</p>
                  <p>• Each chapter should be at least 10 seconds long</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generation History */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Generation History</h3>
          {chapters.length > 0 && (
            <span className="text-sm text-gray-400">
              {chapters.length} generation{chapters.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No Generation History</h4>
            <p className="text-gray-400">
              Your generated chapters will appear here for easy access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chaptersItem) => (
              <div
                key={chaptersItem.id}
                onClick={() => selectChapters(chaptersItem)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  selectedChapters?.id === chaptersItem.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={chaptersItem.video_thumbnail || `https://img.youtube.com/vi/${chaptersItem.video_id}/maxresdefault.jpg`}
                      alt={chaptersItem.video_title}
                      className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${chaptersItem.video_id}/hqdefault.jpg`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                        {chaptersItem.video_title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{new Date(chaptersItem.created_at).toLocaleDateString()}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          chaptersItem.status === 'completed' ? 'bg-emerald-400' :
                          chaptersItem.status === 'pending' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`} />
                        <span className="capitalize">{chaptersItem.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChapters(chaptersItem.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                {/* Status Indicator */}
                {chaptersItem.status === 'pending' && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}