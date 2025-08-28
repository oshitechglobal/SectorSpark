import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProgressStats, PlatformType } from '../../types/progress';
import { Youtube, Users, Linkedin, Instagram, Twitter, Mail } from 'lucide-react';

interface LatestNumbersChartProps {
  stats: ProgressStats;
}

const platformConfig = {
  youtube: { 
    icon: Youtube, 
    color: '#ff0000', 
    name: 'YouTube',
    getMetric: (metrics: any) => metrics.subscribers || 0
  },
  skool: { 
    icon: Users, 
    color: '#8b5cf6', 
    name: 'Skool',
    getMetric: (metrics: any) => metrics.members || 0
  },
  linkedin: { 
    icon: Linkedin, 
    color: '#0077b5', 
    name: 'LinkedIn',
    getMetric: (metrics: any) => metrics.followers || 0
  },
  instagram: { 
    icon: Instagram, 
    color: '#e1306c', 
    name: 'Instagram',
    getMetric: (metrics: any) => metrics.followers || 0
  },
  twitter: { 
    icon: Twitter, 
    color: '#1da1f2', 
    name: 'Twitter',
    getMetric: (metrics: any) => metrics.followers || 0
  },
  email: { 
    icon: Mail, 
    color: '#10b981', 
    name: 'Email',
    getMetric: (metrics: any) => metrics.emailSubscribers || 0
  },
};

export function LatestNumbersChart({ stats }: LatestNumbersChartProps) {
  const chartData = Object.entries(platformConfig).map(([platform, config]) => {
    const platformStats = stats.platformStats[platform as PlatformType];
    const value = platformStats ? config.getMetric(platformStats.latestMetrics) : 0;
    
    return {
      platform: config.name,
      value,
      color: config.color,
    };
  }).filter(item => item.value > 0); // Only show platforms with data

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-cyan-400">
            {payload[0].value.toLocaleString()} followers/subscribers
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Latest Numbers</h3>
        <p className="text-sm text-gray-400">Current follower and subscriber counts across platforms</p>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="platform" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#374151' }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="url(#barGradient)"
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(platformConfig).map(([platform, config]) => {
              const platformStats = stats.platformStats[platform as PlatformType];
              const value = platformStats ? config.getMetric(platformStats.latestMetrics) : 0;
              const Icon = config.icon;
              
              if (value === 0) return null;
              
              return (
                <div key={platform} className="bg-gray-800/30 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon size={20} style={{ color: config.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">{config.name}</p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Data Yet</h4>
          <p className="text-gray-400">
            Start tracking your daily progress to see your latest numbers here.
          </p>
        </div>
      )}
    </div>
  );
}