import React, { useState } from 'react';
import { useVideoRevenue } from '../../hooks/useVideoRevenue';
import { VideoRevenueForm } from './VideoRevenueForm';
import { VideoRevenueViewer } from './VideoRevenueViewer';
import { VideoRevenueGeneration, VideoRevenuePipelineData } from '../../types/videoRevenue';
import { 
  Plus, 
  Video, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Calendar,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  Mail,
  Users,
  Linkedin,
  Heart,
  Archive,
  FileText,
  Eye,
  Loader2
} from 'lucide-react';

export function VideoToRevenuePipeline() {
  const {
    generations,
    loading,
    error,
    createGeneration,
    updateGeneration,
    deleteGeneration,
    toggleFavorite,
    getGenerationsByStatus,
    getFavoriteGenerations,
    getGenerationStats,
    getPipelineData,
    refetch
  } = useVideoRevenue();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<VideoRevenuePipelineData | null>(null);
  const [loadingPipeline, setLoadingPipeline] = useState<string>('');

  const stats = getGenerationStats();

  // Filter generations based on status and search
  const filteredGenerations = React.useMemo(() => {
    let filtered = generations;

    // Filter by status
    if (selectedStatus === 'favorites') {
      filtered = getFavoriteGenerations();
    } else if (selectedStatus !== 'all') {
      filtered = getGenerationsByStatus(selectedStatus as any);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(generation =>
        generation.video_title.toLowerCase().includes(query) ||
        generation.template_resource.toLowerCase().includes(query) ||
        generation.main_teaching?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [generations, selectedStatus, searchQuery, getFavoriteGenerations, getGenerationsByStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    try {
      await toggleFavorite(id);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleCardClick = async (generation: VideoRevenueGeneration) => {
    setLoadingPipeline(generation.id);
    try {
      const pipelineData = await getPipelineData(generation.id);
      setSelectedPipeline(pipelineData);
    } catch (err) {
      console.error('Failed to load pipeline data:', err);
    } finally {
      setLoadingPipeline('');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Pipelines', count: stats.totalGenerations },
    { value: 'draft', label: 'Draft', count: stats.draftCount },
    { value: 'ready', label: 'Ready', count: stats.readyCount },
    { value: 'published', label: 'Published', count: stats.publishedCount },
    { value: 'archived', label: 'Archived', count: stats.archivedCount },
    { value: 'favorites', label: 'Favorites', count: stats.favoriteCount },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'ready': return 'bg-blue-500/20 text-blue-400';
      case 'published': return 'bg-emerald-500/20 text-emerald-400';
      case 'archived': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return FileText;
      case 'ready': return Eye;
      case 'published': return TrendingUp;
      case 'archived': return Archive;
      default: return FileText;
    }
  };

  // Show pipeline viewer if selected
  if (selectedPipeline) {
    return (
      <VideoRevenueViewer 
        pipelineData={selectedPipeline}
        onBack={() => setSelectedPipeline(null)}
      />
    );
  }

  // Show create form
  if (showCreateForm) {
    return <VideoRevenueForm onBack={() => setShowCreateForm(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your video revenue pipelines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Pipelines</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Video-to-Revenue Pipeline</h1>
          <p className="text-gray-400">
            Transform your videos into comprehensive revenue-generating content across all platforms.
            {stats.totalGenerations > 0 && (
              <span className="ml-2 text-cyan-400">
                {stats.totalGenerations} pipeline{stats.totalGenerations !== 1 ? 's' : ''} • {stats.publishedCount} published
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Pipeline</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Video size={20} className="text-cyan-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalGenerations}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FileText size={20} className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Draft</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.draftCount}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Eye size={20} className="text-blue-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Ready</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.readyCount}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp size={20} className="text-emerald-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Published</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.publishedCount}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Archive size={20} className="text-orange-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Archived</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.archivedCount}</p>
        </div>
        
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Heart size={20} className="text-rose-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">Favorites</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.favoriteCount}</p>
        </div>
      </div>

      {/* Filters and Search */}
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
                placeholder="Search pipelines..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedStatus === option.value
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipelines Grid */}
      {filteredGenerations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No Pipelines Found' : 'No Pipelines Yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Create your first video-to-revenue pipeline to get started.'
            }
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Plus size={18} />
              <span>Create Your First Pipeline</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((generation) => {
            const StatusIcon = getStatusIcon(generation.status);
            const isLoading = loadingPipeline === generation.id;
            
            return (
              <div
                key={generation.id}
                onClick={() => !isLoading && handleCardClick(generation)}
                className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
              >
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 size={24} className="text-cyan-400 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-cyan-400">Loading pipeline...</p>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
                      <Video size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-gradient transition-all duration-300">
                        {generation.video_title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">{generation.template_resource}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleFavorite(e, generation.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      generation.is_favorite
                        ? 'text-rose-400 bg-rose-500/20'
                        : 'text-gray-400 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                  >
                    <Heart size={16} className={generation.is_favorite ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Status and Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(generation.status)}`}>
                    <StatusIcon size={12} />
                    <span className="capitalize">{generation.status}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(generation.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Main Teaching Preview */}
                {generation.main_teaching && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                      {generation.main_teaching}
                    </p>
                  </div>
                )}

                {/* Key Insights */}
                {generation.key_insights.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-400 mb-2">Key Insights</p>
                    <div className="flex flex-wrap gap-1">
                      {generation.key_insights.slice(0, 3).map((insight, index) => (
                        <span
                          key={index}
                          className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full text-xs line-clamp-1"
                        >
                          {insight.length > 20 ? `${insight.substring(0, 20)}...` : insight}
                        </span>
                      ))}
                      {generation.key_insights.length > 3 && (
                        <span className="text-xs text-gray-500">+{generation.key_insights.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Types Indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Mail size={12} />
                      <span>Email</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Users size={12} />
                      <span>Skool</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Linkedin size={12} />
                      <span>LinkedIn</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{new Date(generation.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Click to View Indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-xs font-medium">
                    Click to view
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}