import React from 'react';
import { useContentPieces } from '../../hooks/useContentPieces';
import { useDailyProgress } from '../../hooks/useDailyProgress';
import { useVideoRevenue } from '../../hooks/useVideoRevenue';
import { useYouTubeAnalysis } from '../../hooks/useYouTubeAnalysis';
import { useAINews } from '../../hooks/useAINews';
import { 
  Clock, 
  Layers3, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Newspaper,
  CheckCircle,
  Edit,
  Upload,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: 'content' | 'progress' | 'revenue' | 'analysis' | 'news';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  color: string;
}

export function RecentActivity() {
  const { content } = useContentPieces();
  const { progressData } = useDailyProgress();
  const { generations } = useVideoRevenue();
  const { analyses } = useYouTubeAnalysis();
  const { news, postOutputs } = useAINews();

  const activities = React.useMemo(() => {
    const allActivities: Activity[] = [];

    // Content activities
    content.slice(0, 3).forEach(item => {
      allActivities.push({
        id: `content-${item.id}`,
        type: 'content',
        title: item.stage === 'publish' ? 'Published Content' : 'Updated Content',
        description: item.title,
        timestamp: item.updated_at,
        icon: item.stage === 'publish' ? Upload : Edit,
        color: item.stage === 'publish' ? 'text-emerald-400' : 'text-blue-400',
      });
    });

    // Progress activities
    progressData.slice(0, 2).forEach(entry => {
      allActivities.push({
        id: `progress-${entry.id}`,
        type: 'progress',
        title: 'Daily Progress Logged',
        description: `${entry.platform.charAt(0).toUpperCase() + entry.platform.slice(1)} metrics updated`,
        timestamp: entry.created_at,
        icon: Calendar,
        color: 'text-violet-400',
      });
    });

    // Revenue pipeline activities
    generations.slice(0, 2).forEach(gen => {
      allActivities.push({
        id: `revenue-${gen.id}`,
        type: 'revenue',
        title: gen.status === 'published' ? 'Pipeline Published' : 'Pipeline Created',
        description: gen.video_title,
        timestamp: gen.updated_at,
        icon: DollarSign,
        color: gen.status === 'published' ? 'text-emerald-400' : 'text-yellow-400',
      });
    });

    // Analysis activities
    analyses.slice(0, 2).forEach(analysis => {
      allActivities.push({
        id: `analysis-${analysis.id}`,
        type: 'analysis',
        title: analysis.status === 'completed' ? 'Video Analysis Complete' : 'Video Analysis Started',
        description: analysis.video_title,
        timestamp: analysis.updated_at,
        icon: BarChart3,
        color: analysis.status === 'completed' ? 'text-emerald-400' : 'text-blue-400',
      });
    });

    // News activities
    postOutputs.slice(0, 2).forEach(output => {
      const newsItem = news.find(n => n.id === output.news_id);
      allActivities.push({
        id: `news-${output.id}`,
        type: 'news',
        title: 'LinkedIn Posts Generated',
        description: newsItem?.title || 'AI News Article',
        timestamp: output.created_at,
        icon: Newspaper,
        color: 'text-cyan-400',
      });
    });

    // Sort by timestamp (most recent first)
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [content, progressData, generations, analyses, news, postOutputs]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return format(date, 'MMM d');
  };

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Recent Activity</h3>
        <p className="text-sm text-gray-400">Latest updates across all your systems</p>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors group"
              >
                <div className={`p-2 rounded-lg bg-gray-800/50 ${activity.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium group-hover:text-gradient transition-all duration-200">
                    {activity.title}
                  </p>
                  <p className="text-gray-400 text-xs line-clamp-1 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <Clock size={10} className="text-gray-500" />
                    <span className="text-gray-500 text-xs">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">No recent activity</p>
          <p className="text-gray-500 text-xs mt-1">Start using your systems to see activity here</p>
        </div>
      )}
    </div>
  );
}