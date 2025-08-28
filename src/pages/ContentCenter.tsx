import React, { useState, useEffect } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { KanbanBoard } from '../components/Content/KanbanBoard';
import { CalendarView } from '../components/Content/CalendarView';
import { AnalyticsView } from '../components/Content/AnalyticsView';
import { ContentModal } from '../components/Content/ContentModal';
import { ContentPiece, ContentStage, ViewMode, AnalyticsData } from '../types';
import { Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { addMonths, subMonths } from 'date-fns';
import { useContentPieces } from '../hooks/useContentPieces';
import { useAuth } from '../hooks/useAuth';

export function ContentCenter() {
  const { user } = useAuth();
  const {
    content,
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    moveContentToStage,
    getContentByStage,
    getAnalytics,
    refetch
  } = useContentPieces();

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentPiece | undefined>();
  const [selectedStage, setSelectedStage] = useState<ContentStage>('idea');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate analytics data from real content
  const analyticsData: AnalyticsData = React.useMemo(() => {
    const analytics = getAnalytics();
    const platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'podcast'] as const;
    const stages = ['idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'] as const;

    return {
      platformDistribution: platforms.map(platform => ({
        platform,
        count: analytics.platformDistribution[platform] || 0,
        percentage: analytics.totalContent > 0 
          ? Math.round(((analytics.platformDistribution[platform] || 0) / analytics.totalContent) * 100)
          : 0
      })),
      productivityMetrics: {
        completionRate: Math.round(analytics.completionRate),
        qualityScore: 85, // This could be calculated based on content with attention_value
        activeProjects: analytics.totalContent - analytics.publishedContent,
        weeklyEfficiency: Math.min(analytics.totalContent, 20), // Cap at 20 for display
      },
      pipelineFlow: stages.map((stage, index) => ({
        stage,
        count: analytics.stageDistribution[stage] || 0,
        flow: analytics.totalContent > 0 
          ? Math.round(((analytics.stageDistribution[stage] || 0) / analytics.totalContent) * 100)
          : 0
      })),
    };
  }, [content, getAnalytics]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId as ContentStage;
    
    try {
      await moveContentToStage(draggableId, newStage, destination.index);
    } catch (err) {
      console.error('Failed to move content:', err);
      // You could show a toast notification here
    }
  };

  const handleCreateContent = (stage?: ContentStage, date?: Date) => {
    setEditingContent(undefined);
    if (stage) {
      setSelectedStage(stage);
    }
    if (date) {
      setSelectedDate(date);
    }
    setIsModalOpen(true);
  };

  const handleEditContent = (contentItem: ContentPiece) => {
    setEditingContent(contentItem);
    setIsModalOpen(true);
  };

  const handleSaveContent = async (contentData: Partial<ContentPiece>) => {
    try {
      if (editingContent) {
        // Update existing content
        await updateContent(editingContent.id, contentData);
      } else {
        // Create new content
        const newContentData = {
          ...contentData,
          user_id: user!.id,
          stage: selectedStage,
          order: 0,
          lead_magnets: contentData.lead_magnets || [],
        } as Omit<ContentPiece, 'id' | 'created_at' | 'updated_at'>;
        
        await createContent(newContentData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save content:', err);
      // You could show a toast notification here
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content piece?')) {
      try {
        await deleteContent(id);
      } catch (err) {
        console.error('Failed to delete content:', err);
        // You could show a toast notification here
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh content:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your content...</p>
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
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Content</h3>
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Content Command Center</h1>
          <p className="text-gray-400">
            Manage your content pipeline from idea to publication. 
            {content.length > 0 && (
              <span className="ml-2 text-cyan-400">
                {content.length} total pieces • {content.filter(c => c.stage === 'publish').length} published
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
            onClick={() => handleCreateContent()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Content</span>
          </button>
        </div>
      </div>

      {/* View Toggle and Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 glass-card p-1">
          {(['board', 'calendar', 'analytics'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                viewMode === mode
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {mode} View
            </button>
          ))}
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevMonth}
              className="btn-secondary flex items-center space-x-2"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>
            <span className="text-white font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full">
        {viewMode === 'board' && (
          <KanbanBoard 
            content={content} 
            onDragEnd={handleDragEnd}
            onCreateContent={handleCreateContent}
            onEditContent={handleEditContent}
          />
        )}
        
        {viewMode === 'calendar' && (
          <CalendarView
            currentDate={currentDate}
            content={content}
            onDateSelect={setSelectedDate}
            onCreateContent={handleCreateContent}
          />
        )}
        
        {viewMode === 'analytics' && (
          <AnalyticsView
            content={content}
            analyticsData={analyticsData}
          />
        )}
      </div>

      {/* Stats */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {(['idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'] as ContentStage[]).map(stage => {
            const count = getContentByStage(stage).length;
            return (
              <div key={stage} className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-sm text-gray-400 capitalize">{stage}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {content.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Content Yet</h3>
          <p className="text-gray-400 mb-6">
            Start building your content pipeline by creating your first piece.
          </p>
          <button 
            onClick={() => handleCreateContent()}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus size={18} />
            <span>Create Your First Content</span>
          </button>
        </div>
      )}

      {/* Content Modal */}
      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContent}
        content={editingContent}
        initialStage={selectedStage}
      />
    </div>
  );
}