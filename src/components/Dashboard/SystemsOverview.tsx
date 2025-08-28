import React from 'react';
import { useYouTubeAnalysis } from '../../hooks/useYouTubeAnalysis';
import { useCommentScraping } from '../../hooks/useCommentScraping';
import { useYouTubeChapters } from '../../hooks/useYouTubeChapters';
import { useAINews } from '../../hooks/useAINews';
import { useVideoRevenue } from '../../hooks/useVideoRevenue';
import { 
  BarChart3, 
  MessageSquare, 
  List, 
  Newspaper, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

export function SystemsOverview() {
  const { analyses } = useYouTubeAnalysis();
  const { scrapings } = useCommentScraping();
  const { chapters } = useYouTubeChapters();
  const { news, postOutputs } = useAINews();
  const { generations } = useVideoRevenue();

  const systems = [
    {
      name: 'Video Analyzer',
      icon: BarChart3,
      color: 'from-red-500 to-orange-500',
      total: analyses.length,
      completed: analyses.filter(a => a.status === 'completed').length,
      pending: analyses.filter(a => a.status === 'pending').length,
      failed: analyses.filter(a => a.status === 'failed').length,
    },
    {
      name: 'Comment Scraper',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      total: scrapings.length,
      completed: scrapings.filter(s => s.status === 'completed').length,
      pending: scrapings.filter(s => s.status === 'pending').length,
      failed: scrapings.filter(s => s.status === 'failed').length,
    },
    {
      name: 'Chapters Generator',
      icon: List,
      color: 'from-purple-500 to-pink-500',
      total: chapters.length,
      completed: chapters.filter(c => c.status === 'completed').length,
      pending: chapters.filter(c => c.status === 'pending').length,
      failed: chapters.filter(c => c.status === 'failed').length,
    },
    {
      name: 'AI News',
      icon: Newspaper,
      color: 'from-emerald-500 to-teal-500',
      total: news.length,
      completed: postOutputs.length,
      pending: 0,
      failed: 0,
    },
    {
      name: 'Revenue Pipeline',
      icon: DollarSign,
      color: 'from-yellow-500 to-amber-500',
      total: generations.length,
      completed: generations.filter(g => g.status === 'published').length,
      pending: generations.filter(g => g.status === 'draft' || g.status === 'ready').length,
      failed: 0,
    },
  ];

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Systems Overview</h3>
        <p className="text-sm text-gray-400">Performance across all your AI-powered systems</p>
      </div>

      <div className="space-y-4">
        {systems.map((system, index) => {
          const Icon = system.icon;
          const successRate = system.total > 0 ? (system.completed / system.total) * 100 : 0;
          
          return (
            <div key={index} className="bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${system.color}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{system.name}</h4>
                    <p className="text-xs text-gray-400">{system.total} total operations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gradient">{Math.round(successRate)}%</p>
                  <p className="text-xs text-gray-400">Success Rate</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${system.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${successRate}%` }}
                />
              </div>

              {/* Status Breakdown */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-emerald-400">
                  <CheckCircle size={12} />
                  <span>{system.completed} completed</span>
                </div>
                {system.pending > 0 && (
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Clock size={12} />
                    <span>{system.pending} pending</span>
                  </div>
                )}
                {system.failed > 0 && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <AlertTriangle size={12} />
                    <span>{system.failed} failed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall System Health */}
      <div className="mt-6 pt-6 border-t border-gray-800/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">
              {systems.reduce((acc, sys) => acc + sys.completed, 0)}
            </p>
            <p className="text-xs text-gray-400">Total Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              {systems.reduce((acc, sys) => acc + sys.pending, 0)}
            </p>
            <p className="text-xs text-gray-400">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-400">
              {systems.reduce((acc, sys) => acc + sys.total, 0)}
            </p>
            <p className="text-xs text-gray-400">Total Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}