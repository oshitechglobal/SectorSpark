import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useCommentScraping, CommentScraping } from '../../hooks/useCommentScraping';
import { useAuth } from '../../hooks/useAuth';
import { CategoryOverview } from './CommentScraper/CategoryOverview';
import { VideoInput } from './CommentScraper/VideoInput';
import { VideoPreview } from './CommentScraper/VideoPreview';
import { CategoryResults } from './CommentScraper/CategoryResults';
import { ScrapingHistory } from './CommentScraper/ScrapingHistory';

interface CommentScraperProps {
  onBack: () => void;
}

const COMMENT_CATEGORIES = [
  {
    key: 'most_requested_ai_tools',
    title: 'Most Requested AI Tools',
    description: 'Comments requesting specific AI tools or new tool reviews',
    icon: '🔧',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    key: 'ai_tool_comparisons',
    title: 'AI Tool Comparisons',
    description: 'Comments comparing two or more AI tools',
    icon: '⚖️',
    color: 'from-purple-500 to-pink-500'
  },
  {
    key: 'use_cases_applications',
    title: 'Use Cases & Applications',
    description: 'Comments discussing practical applications or asking how AI can be used in specific fields',
    icon: '💡',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    key: 'problems_complaints',
    title: 'Problems & Complaints',
    description: 'Comments highlighting issues, limitations, or concerns with AI tools',
    icon: '⚠️',
    color: 'from-red-500 to-orange-500'
  },
  {
    key: 'ai_business_monetization',
    title: 'AI Business & Monetization',
    description: 'Comments about using AI for making money, automating businesses, or improving productivity',
    icon: '💰',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    key: 'content_requests_suggestions',
    title: 'Content Requests & Suggestions',
    description: 'Direct requests for specific content topics, tutorials, or new video ideas',
    icon: '📝',
    color: 'from-indigo-500 to-violet-500'
  }
];

export function CommentScraper({ onBack }: CommentScraperProps) {
  const { user } = useAuth();
  const {
    scrapings,
    loading,
    error: hookError,
    getScrapingByVideoId,
    deleteScraping,
    refetch
  } = useCommentScraping();

  const [videoUrl, setVideoUrl] = useState('');
  const [commentCount, setCommentCount] = useState(100);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [selectedScraping, setSelectedScraping] = useState<CommentScraping | null>(null);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        // Check if this video has already been scraped
        const existingScraping = getScrapingByVideoId(videoId);
        if (existingScraping) {
          setSelectedScraping(existingScraping);
        }
      } else {
        setCurrentVideoId('');
      }
    } else {
      setCurrentVideoId('');
    }
  };

  // Submit scraping request (only webhook call, no database entry)
  const handleSubmit = async () => {
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

    if (commentCount < 1 || commentCount > 1000) {
      setError('Comment count must be between 1 and 1000');
      return;
    }

    // Check if this video has already been scraped
    const existingScraping = getScrapingByVideoId(videoId);
    if (existingScraping) {
      setSelectedScraping(existingScraping);
      setError('This video has already been scraped. Select it from the history below.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get video metadata
      const metadata = await getVideoMetadata(videoId);
      
      // Send to webhook - let Make.com handle database entry creation
      const webhookResponse = await fetch('https://hook.us1.make.com/8educpjvbikl8qujtgqu6gst2ecspesh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          videoId,
          commentCount,
          videoTitle: metadata.title,
          videoThumbnail: metadata.thumbnail,
          userId: user.id, // Include user ID for Make.com
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status}`);
      }

      // Show success message
      setError('');
      console.log('Comment scraping request sent successfully');

    } catch (err) {
      console.error('Scraping failed:', err);
      setError('Failed to submit scraping request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export category data
  const exportCategoryData = (category: string[], categoryTitle: string) => {
    const csvContent = [
      ['Comment'],
      ...category.map((comment: string) => [comment.replace(/"/g, '""')])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${categoryTitle.toLowerCase().replace(/\s+/g, '_')}-${selectedScraping?.video_id}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Copy category data to clipboard
  const copyCategoryData = async (category: string[]) => {
    try {
      const text = category.join('\n\n');
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy data:', err);
    }
  };

  // Delete scraping from database
  const handleDeleteScraping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scraping?')) return;
    
    try {
      await deleteScraping(id);
      if (selectedScraping?.id === id) {
        setSelectedScraping(null);
      }
    } catch (err) {
      console.error('Failed to delete scraping:', err);
    }
  };

  // Select scraping from history
  const selectScraping = (scraping: CommentScraping) => {
    setSelectedScraping(scraping);
    setVideoUrl(scraping.video_url);
    setCurrentVideoId(scraping.video_id);
    setCommentCount(scraping.comment_count);
    setError('');
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh scrapings:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your comment scrapings...</p>
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
            <h1 className="text-3xl font-bold text-gradient">YouTube Comment Scraper</h1>
            <p className="text-gray-400">Extract and categorize comments into 6 specific AI-related categories</p>
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

      {/* Categories Overview */}
      <CategoryOverview categories={COMMENT_CATEGORIES} />

      {/* Main Scraping Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VideoInput
          videoUrl={videoUrl}
          commentCount={commentCount}
          currentVideoId={currentVideoId}
          error={error}
          isSubmitting={isSubmitting}
          onUrlChange={handleUrlChange}
          onCommentCountChange={setCommentCount}
          onSubmit={handleSubmit}
        />
        <VideoPreview currentVideoId={currentVideoId} />
      </div>

      {/* Scraping Results */}
      {selectedScraping && selectedScraping.status === 'completed' && (
        <CategoryResults
          scraping={selectedScraping}
          categories={COMMENT_CATEGORIES}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          onExportCategory={exportCategoryData}
          onCopyCategory={copyCategoryData}
        />
      )}

      {/* Scraping History */}
      <ScrapingHistory
        scrapings={scrapings}
        selectedScraping={selectedScraping}
        onSelectScraping={selectScraping}
        onDeleteScraping={handleDeleteScraping}
      />
    </div>
  );
}