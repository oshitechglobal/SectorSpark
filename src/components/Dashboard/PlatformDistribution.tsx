import React from 'react';
import { useContentPieces } from '../../hooks/useContentPieces';
import { useDailyProgress } from '../../hooks/useDailyProgress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Youtube, Instagram, Music, Twitter, Linkedin, FileText, Mic } from 'lucide-react';

const platformConfig = {
  youtube: { color: '#ff0000', icon: Youtube, name: 'YouTube' },
  instagram: { color: '#e1306c', icon: Instagram, name: 'Instagram' },
  tiktok: { color: '#000000', icon: Music, name: 'TikTok' },
  twitter: { color: '#1da1f2', icon: Twitter, name: 'Twitter' },
  linkedin: { color: '#0077b5', icon: Linkedin, name: 'LinkedIn' },
  blog: { color: '#6b7280', icon: FileText, name: 'Blog' },
  podcast: { color: '#8b5cf6', icon: Mic, name: 'Podcast' },
};

export function PlatformDistribution() {
  const { content } = useContentPieces();
  const { progressData } = useDailyProgress();

  const platformData = React.useMemo(() => {
    // Combine content pieces and progress data for comprehensive platform view
    const contentPlatforms = content.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const progressPlatforms = progressData.reduce((acc, entry) => {
      acc[entry.platform] = (acc[entry.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Merge both datasets
    const allPlatforms = new Set([...Object.keys(contentPlatforms), ...Object.keys(progressPlatforms)]);
    
    return Array.from(allPlatforms).map(platform => {
      const config = platformConfig[platform as keyof typeof platformConfig];
      const contentCount = contentPlatforms[platform] || 0;
      const progressCount = progressPlatforms[platform] || 0;
      const totalActivity = contentCount + progressCount;
      
      return {
        name: config?.name || platform,
        value: totalActivity,
        contentPieces: contentCount,
        progressEntries: progressCount,
        color: config?.color || '#6b7280',
        icon: config?.icon || FileText,
      };
    }).filter(item => item.value > 0);
  }, [content, progressData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-cyan-400">Total Activity: {data.value}</p>
          <p className="text-violet-400">Content Pieces: {data.contentPieces}</p>
          <p className="text-emerald-400">Progress Entries: {data.progressEntries}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const Icon = entry.payload.icon;
          return (
            <div key={index} className="flex items-center space-x-2">
              <Icon size={16} style={{ color: entry.color }} />
              <span className="text-gray-300 text-sm">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Platform Distribution</h3>
        <p className="text-sm text-gray-400">Your activity across all platforms</p>
      </div>

      {platformData.length > 0 ? (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {platformData.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <div key={index} className="bg-gray-800/30 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon size={20} style={{ color: platform.color }} />
                  </div>
                  <p className="text-lg font-bold text-white">{platform.value}</p>
                  <p className="text-xs text-gray-400">{platform.name}</p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Platform Data</h4>
          <p className="text-gray-400">Start creating content to see your platform distribution.</p>
        </div>
      )}
    </div>
  );
}