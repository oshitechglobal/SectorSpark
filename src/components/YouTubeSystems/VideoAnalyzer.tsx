import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Play, Copy, FileText, Code, ExternalLink, Clock, Eye, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { useYouTubeAnalysis, YouTubeAnalysis } from '../../hooks/useYouTubeAnalysis';
import { useAuth } from '../../hooks/useAuth';

interface VideoAnalyzerProps {
  onBack: () => void;
}

export function VideoAnalyzer({ onBack }: VideoAnalyzerProps) {
  const { user } = useAuth();
  const {
    analyses,
    loading,
    error: hookError,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    getAnalysisByVideoId,
    completeAnalysis,
    failAnalysis,
    refetch
  } = useYouTubeAnalysis();

  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<YouTubeAnalysis | null>(null);
  const [error, setError] = useState('');
  const [copiedType, setCopiedType] = useState<'text' | 'html' | null>(null);

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
        
        // Check if this video has already been analyzed
        const existingAnalysis = getAnalysisByVideoId(videoId);
        if (existingAnalysis) {
          setSelectedAnalysis(existingAnalysis);
        }
      } else {
        setCurrentVideoId('');
      }
    } else {
      setCurrentVideoId('');
    }
  };

  // Send URL to webhook and start analysis
  const handleAnalyze = async () => {
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

    // Check if this video has already been analyzed
    const existingAnalysis = getAnalysisByVideoId(videoId);
    if (existingAnalysis) {
      setSelectedAnalysis(existingAnalysis);
      setError('This video has already been analyzed. Select it from the history below.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Get video metadata
      const metadata = await getVideoMetadata(videoId);
      
      // Create new analysis entry in database
      const newAnalysis = await createAnalysis({
        video_url: videoUrl,
        video_id: videoId,
        video_title: metadata.title,
        video_thumbnail: metadata.thumbnail,
      });

      setSelectedAnalysis(newAnalysis);

      // Send to webhook
      const webhookResponse = await fetch('https://hook.us1.make.com/pu6eirl3xl2t2wswx2w5qg8ahjcxaimy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          videoId,
          analysisId: newAnalysis.id,
          timestamp: new Date().toISOString(),
          userId: user.id, // Include user ID for Make.com
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status}`);
      }

      console.log('Analysis request sent to webhook successfully');

    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to start analysis. Please try again.');
      setIsAnalyzing(false);
      
      // Mark analysis as failed if it was created
      if (selectedAnalysis) {
        await failAnalysis(selectedAnalysis.id, err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  // Copy analysis content
  const copyContent = async (type: 'text' | 'html') => {
    if (!selectedAnalysis?.analysis_html) return;

    try {
      let content = selectedAnalysis.analysis_html;
      
      if (type === 'text') {
        // Strip HTML tags for text copy
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        content = tempDiv.textContent || tempDiv.innerText || '';
      }

      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  // Delete analysis from database
  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      await deleteAnalysis(id);
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  // Select analysis from history
  const selectAnalysis = (analysis: YouTubeAnalysis) => {
    setSelectedAnalysis(analysis);
    setVideoUrl(analysis.video_url);
    setCurrentVideoId(analysis.video_id);
    setError('');
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh analyses:', err);
    }
  };

  // Listen for real-time updates to stop analyzing when completed
  useEffect(() => {
    if (selectedAnalysis && selectedAnalysis.status === 'completed' && isAnalyzing) {
      setIsAnalyzing(false);
    }
    if (selectedAnalysis && selectedAnalysis.status === 'failed' && isAnalyzing) {
      setIsAnalyzing(false);
      setError('Analysis failed. Please try again.');
    }
  }, [selectedAnalysis, isAnalyzing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your analyses...</p>
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
            <h1 className="text-3xl font-bold text-gradient">YouTube Video Analyzer</h1>
            <p className="text-gray-400">Analyze video performance and get AI-powered optimization insights</p>
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

      {/* Main Analysis Section */}
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
              onClick={handleAnalyze}
              disabled={isAnalyzing || !currentVideoId}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Analyze Video</span>
                </>
              )}
            </button>
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

      {/* Analysis Results */}
      {selectedAnalysis && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
            {selectedAnalysis.status === 'completed' && selectedAnalysis.analysis_html && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyContent('text')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FileText size={16} />
                  <span>{copiedType === 'text' ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => copyContent('html')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Code size={16} />
                  <span>{copiedType === 'html' ? 'Copied!' : 'Copy HTML'}</span>
                </button>
              </div>
            )}
          </div>

          {selectedAnalysis.status === 'pending' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white mb-2">Analysis in Progress</h4>
              <p className="text-gray-400">
                Our AI is analyzing your video. This may take a few moments...
              </p>
            </div>
          )}

          {selectedAnalysis.status === 'failed' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Analysis Failed</h4>
              <p className="text-gray-400 mb-4">
                Something went wrong during the analysis. Please try again.
              </p>
              <button onClick={handleAnalyze} className="btn-primary">
                Retry Analysis
              </button>
            </div>
          )}

          {selectedAnalysis.status === 'completed' && selectedAnalysis.analysis_html && (
            <div 
              className="youtube-analysis-viewer bg-white rounded-xl p-6 shadow-lg"
              dangerouslySetInnerHTML={{ __html: selectedAnalysis.analysis_html }}
            />
          )}
        </div>
      )}

      {/* Analysis History */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Analysis History</h3>
          {analyses.length > 0 && (
            <span className="text-sm text-gray-400">
              {analyses.length} analysis{analyses.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No Analysis History</h4>
            <p className="text-gray-400">
              Your analyzed videos will appear here for easy access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => selectAnalysis(analysis)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  selectedAnalysis?.id === analysis.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={analysis.video_thumbnail || `https://img.youtube.com/vi/${analysis.video_id}/maxresdefault.jpg`}
                      alt={analysis.video_title}
                      className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${analysis.video_id}/hqdefault.jpg`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                        {analysis.video_title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          analysis.status === 'completed' ? 'bg-emerald-400' :
                          analysis.status === 'pending' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`} />
                        <span className="capitalize">{analysis.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAnalysis(analysis.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                {/* Status Indicator */}
                {analysis.status === 'pending' && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .youtube-analysis-viewer {
          /* Ensure the content displays properly with white background */
          background: white !important;
          color: #000 !important;
        }
        
        .youtube-analysis-viewer * {
          /* Preserve all inline styles from the HTML content */
          box-sizing: border-box;
        }
        
        .youtube-analysis-viewer div {
          display: block;
        }
        
        .youtube-analysis-viewer h1,
        .youtube-analysis-viewer h2,
        .youtube-analysis-viewer h3 {
          display: block;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .youtube-analysis-viewer ul,
        .youtube-analysis-viewer ol {
          display: block;
          list-style: revert;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .youtube-analysis-viewer li {
          display: list-item;
          margin: 0.5em 0;
        }
        
        .youtube-analysis-viewer strong {
          font-weight: bold;
        }
        
        .youtube-analysis-viewer p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}