import React from 'react';
import { useContentPieces } from '../../hooks/useContentPieces';
import { useDailyProgress } from '../../hooks/useDailyProgress';
import { useVideoRevenue } from '../../hooks/useVideoRevenue';
import { useYouTubeAnalysis } from '../../hooks/useYouTubeAnalysis';
import { useAINews } from '../../hooks/useAINews';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  DollarSign, 
  Video, 
  Layers3,
  Calendar,
  Zap
} from 'lucide-react';

export function RealTimeMetrics() {
  const { content } = useContentPieces();
  const { getProgressStats } = useDailyProgress();
  const { getGenerationStats } = useVideoRevenue();
  const { analyses } = useYouTubeAnalysis();
  const { getNewsStats } = useAINews();

  const contentStats = React.useMemo(() => {
    const totalContent = content.length;
    const publishedContent = content.filter(c => c.stage === 'publish').length;
    const completionRate = totalContent > 0 ? (publishedContent / totalContent) * 100 : 0;
    
    return { totalContent, publishedContent, completionRate };
  }, [content]);

  const progressStats = getProgressStats();
  const revenueStats = getGenerationStats();
  const newsStats = getNewsStats();

  const metrics = [
    {
      title: "Content Pieces",
      value: contentStats.totalContent,
      change: contentStats.completionRate,
      icon: Layers3,
      gradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
      description: `${contentStats.publishedContent} published`
    },
    {
      title: "Project 1460 Days",
      value: progressStats.totalDays,
      change: progressStats.currentStreak,
      icon: Calendar,
      gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
      description: `${progressStats.currentStreak} day streak`
    },
    {
      title: "Revenue Pipelines",
      value: revenueStats.totalGenerations,
      change: revenueStats.publishedCount,
      icon: DollarSign,
      gradient: "bg-gradient-to-r from-emerald-500 to-green-500",
      description: `${revenueStats.publishedCount} published`
    },
    {
      title: "YouTube Analyses",
      value: analyses.length,
      change: analyses.filter(a => a.status === 'completed').length,
      icon: Video,
      gradient: "bg-gradient-to-r from-red-500 to-pink-500",
      description: `${analyses.filter(a => a.status === 'completed').length} completed`
    },
    {
      title: "AI News Tracked",
      value: newsStats.totalNews,
      change: newsStats.totalGeneratedPosts,
      icon: TrendingUp,
      gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
      description: `${newsStats.totalGeneratedPosts} posts generated`
    },
    {
      title: "Completion Rate",
      value: `${Math.round(progressStats.completionRate)}%`,
      change: progressStats.longestStreak,
      icon: Zap,
      gradient: "bg-gradient-to-r from-indigo-500 to-blue-500",
      description: `${progressStats.longestStreak} best streak`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <div 
            key={metric.title}
            className="glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Metric Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold text-white mt-1 group-hover:text-gradient transition-all duration-300">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${metric.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800/50 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${metric.gradient} transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${Math.min(100, typeof metric.change === 'number' ? (metric.change / (typeof metric.value === 'number' ? metric.value : 100)) * 100 : 0)}%` 
                  }}
                />
              </div>

              {/* Pulse Animation */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        );
      })}
    </div>
  );
}