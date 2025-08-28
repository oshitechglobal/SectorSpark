import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ExternalLink, Copy, RefreshCw, Calendar, TrendingUp, AlertCircle, Clock, Bookmark, Eye, Zap, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAINews, AINews, LinkedInPostOutput } from '../../hooks/useAINews';
import { LinkedInPostViewer } from './LinkedInPostViewer';

interface LatestAINewsProps {
  onBack: () => void;
}

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItem: AINews | null;
}

function SummaryModal({ isOpen, onClose, newsItem }: SummaryModalProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const copySummary = async () => {
    if (!newsItem?.summary) return;
    
    try {
      await navigator.clipboard.writeText(newsItem.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  if (!isOpen || !newsItem) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-800/30 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-white line-clamp-2">{newsItem.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{newsItem.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Summary</h3>
              <button
                onClick={copySummary}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy size={16} />
                <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {newsItem.summary || 'No summary available for this article.'}
              </p>
            </div>
          </div>

          {/* Article Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Published:</span>
              <span className="text-gray-200">{new Date(newsItem.published_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Relevance Score:</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                newsItem.relevance_score >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                newsItem.relevance_score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {newsItem.relevance_score}%
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Category:</span>
              <span className="text-gray-200 capitalize">{newsItem.category}</span>
            </div>

            {newsItem.tags.length > 0 && (
              <div>
                <span className="text-gray-400 text-sm block mb-2">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {newsItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-800/30">
            <button
              onClick={() => window.open(newsItem.url, '_blank')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ExternalLink size={16} />
              <span>Read Full Article</span>
            </button>
            <button
              onClick={onClose}
              className="btn-primary flex-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LatestAINews({ onBack }: LatestAINewsProps) {
  const { user } = useAuth();
  const {
    news,
    postOutputs,
    loading,
    error: hookError,
    createNews,
    deleteNews,
    getNewsByCategory,
    getNewsStats,
    getLinkedInPostOutputByNewsId,
    generatePost,
    refetch
  } = useAINews();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [summaryModal, setSummaryModal] = useState<{ isOpen: boolean; newsItem: AINews | null }>({
    isOpen: false,
    newsItem: null
  });
  const [generatingPost, setGeneratingPost] = useState<string>('');
  const [postViewer, setPostViewer] = useState<{ isOpen: boolean; postOutput: LinkedInPostOutput | null }>({
    isOpen: false,
    postOutput: null
  });

  // Simplified categories since we don't have all the complex ones
  const categories = [
    { id: 'all', label: 'All News', icon: '📰' },
    { id: 'general', label: 'General AI', icon: '🤖' },
    { id: 'tools', label: 'AI Tools', icon: '🛠️' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'business', label: 'Business', icon: '💼' },
  ];

  // Filter news based on category and search
  const filteredNews = getNewsByCategory(selectedCategory).filter(item => {
    if (searchQuery === '') return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower) ||
      item.name.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Refresh news from external source
  const handleRefreshNews = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsRefreshing(true);
    setError('');

    try {
      // Send request to webhook for latest AI news
      const webhookResponse = await fetch('https://hook.us1.make.com/ai-news-webhook-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          category: selectedCategory,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Failed to fetch news: ${webhookResponse.status}`);
      }

      // Refresh local data
      await refetch();

    } catch (err) {
      console.error('Failed to refresh news:', err);
      setError('Failed to refresh news. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // View summary in modal
  const viewSummary = (item: AINews) => {
    setSummaryModal({ isOpen: true, newsItem: item });
  };

  // Close summary modal
  const closeSummaryModal = () => {
    setSummaryModal({ isOpen: false, newsItem: null });
  };

  // Open article in new tab
  const openArticle = (url: string) => {
    window.open(url, '_blank');
  };

  // Generate LinkedIn post from article and send to webhook
  const handleGeneratePost = async (item: AINews) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Check if post already exists
    const existingOutput = getLinkedInPostOutputByNewsId(item.id);
    if (existingOutput) {
      setPostViewer({ isOpen: true, postOutput: existingOutput });
      return;
    }

    setGeneratingPost(item.id);
    setError('');

    try {
      const postOutput = await generatePost(item);
      
      if (postOutput) {
        // Show the generated posts in the viewer
        setPostViewer({ isOpen: true, postOutput });
        
        // Show success feedback
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(''), 3000);
      }

    } catch (err) {
      console.error('Failed to generate post:', err);
      setError('Failed to generate LinkedIn post. Please try again.');
    } finally {
      setGeneratingPost('');
    }
  };

  // View existing generated posts
  const viewGeneratedPosts = (item: AINews) => {
    const existingOutput = getLinkedInPostOutputByNewsId(item.id);
    if (existingOutput) {
      setPostViewer({ isOpen: true, postOutput: existingOutput });
    }
  };

  // Close post viewer
  const closePostViewer = () => {
    setPostViewer({ isOpen: false, postOutput: null });
  };

  // Toggle bookmark
  const toggleBookmark = (itemId: string) => {
    const newBookmarks = new Set(bookmarkedItems);
    if (newBookmarks.has(itemId)) {
      newBookmarks.delete(itemId);
    } else {
      newBookmarks.add(itemId);
    }
    setBookmarkedItems(newBookmarks);
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const stats = getNewsStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AI news...</p>
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
            <h1 className="text-3xl font-bold text-gradient">Latest AI News</h1>
            <p className="text-gray-400">Curated AI news for your LinkedIn content creation</p>
          </div>
        </div>
        <button
          onClick={handleRefreshNews}
          disabled={isRefreshing}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Updating...' : 'Refresh News'}</span>
        </button>
      </div>

      {/* Error Display */}
      {(error || hookError) && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400">{error || hookError}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{stats.totalNews} articles</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} />
              <span>{stats.avgRelevanceScore}% avg relevance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap size={16} />
              <span>{stats.totalGeneratedPosts} posts generated</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No News Found</h4>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'Try adjusting your search terms or category filter.' : 'No news available yet. Click "Refresh News" to fetch the latest articles.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleRefreshNews}
              disabled={isRefreshing}
              className="btn-primary"
            >
              Refresh News
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNews.map((item) => {
            const hasGeneratedPosts = getLinkedInPostOutputByNewsId(item.id);
            
            return (
              <div key={item.id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" />
                    <span className="text-sm text-gray-400">{item.name}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{formatTimeAgo(item.published_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.relevance_score >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                      item.relevance_score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.relevance_score}% relevant
                    </div>
                    <button
                      onClick={() => toggleBookmark(item.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        bookmarkedItems.has(item.id)
                          ? 'text-yellow-400 bg-yellow-500/20'
                          : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                      }`}
                    >
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-3 leading-tight">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {item.summary}
                </p>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 4).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 4 && (
                      <span className="text-xs text-gray-500">+{item.tags.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewSummary(item)}
                      className="btn-secondary flex items-center space-x-2 text-sm"
                    >
                      <Eye size={14} />
                      <span>View Summary</span>
                    </button>
                    
                    <button
                      onClick={() => openArticle(item.url)}
                      className="btn-secondary flex items-center space-x-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      <span>Open</span>
                    </button>

                    {hasGeneratedPosts && (
                      <button
                        onClick={() => viewGeneratedPosts(item)}
                        className="btn-secondary flex items-center space-x-2 text-sm bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      >
                        <Eye size={14} />
                        <span>View Posts</span>
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleGeneratePost(item)}
                    disabled={generatingPost === item.id}
                    className="btn-primary flex items-center space-x-2 text-sm"
                  >
                    {generatingPost === item.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : hasGeneratedPosts ? (
                      <>
                        <Zap size={14} />
                        <span>View Generated</span>
                      </>
                    ) : copiedId === item.id ? (
                      <>
                        <Zap size={14} />
                        <span>Generated!</span>
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {filteredNews.length > 0 && (
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Search size={20} className="text-cyan-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Total Articles</span>
              </div>
              <p className="text-2xl font-bold text-white">{filteredNews.length}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp size={20} className="text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Avg Relevance</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {filteredNews.length > 0 
                  ? Math.round(filteredNews.reduce((acc, item) => acc + item.relevance_score, 0) / filteredNews.length)
                  : 0}%
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar size={20} className="text-violet-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Latest Update</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {filteredNews.length > 0 ? formatTimeAgo(filteredNews[0].published_at) : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Bookmark size={20} className="text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Bookmarked</span>
              </div>
              <p className="text-2xl font-bold text-white">{bookmarkedItems.size}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      <SummaryModal
        isOpen={summaryModal.isOpen}
        onClose={closeSummaryModal}
        newsItem={summaryModal.newsItem}
      />

      {/* LinkedIn Post Viewer */}
      <LinkedInPostViewer
        isOpen={postViewer.isOpen}
        onClose={closePostViewer}
        postOutput={postViewer.postOutput}
      />
    </div>
  );
}