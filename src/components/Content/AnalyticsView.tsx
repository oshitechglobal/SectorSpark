import React from 'react';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { ContentPiece, AnalyticsData } from '../../types';
import { Target, TrendingUp, Layers, Zap } from 'lucide-react';

interface AnalyticsViewProps {
  content: ContentPiece[];
  analyticsData: AnalyticsData;
}

export function AnalyticsView({ content, analyticsData }: AnalyticsViewProps) {
  const { platformDistribution, productivityMetrics, pipelineFlow } = analyticsData;

  const CircularProgress = ({ 
    value, 
    max = 100, 
    size = 120, 
    strokeWidth = 8, 
    color = '#06b6d4' 
  }: {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(value)}{max === 100 ? '%' : ''}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Productivity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Target size={24} className="text-emerald-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-300">Completion Rate</h3>
          </div>
          <CircularProgress 
            value={productivityMetrics.completionRate} 
            color="#10b981"
          />
        </div>

        <div className="glass-card p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-violet-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-300">Quality Score</h3>
          </div>
          <CircularProgress 
            value={productivityMetrics.qualityScore} 
            color="#8b5cf6"
          />
        </div>

        <div className="glass-card p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Layers size={24} className="text-cyan-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-300">Active Projects</h3>
          </div>
          <CircularProgress 
            value={productivityMetrics.activeProjects} 
            max={50}
            color="#06b6d4"
          />
        </div>

        <div className="glass-card p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap size={24} className="text-amber-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-300">Weekly Efficiency</h3>
          </div>
          <CircularProgress 
            value={productivityMetrics.weeklyEfficiency} 
            max={20}
            color="#f59e0b"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Distribution Radar */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={platformDistribution}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="platform" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                className="capitalize"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 'dataMax']} 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <Radar
                name="Content Count"
                dataKey="count"
                stroke="#06b6d4"
                fill="url(#radarGradient)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Content Pipeline Flow */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Content Pipeline Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pipelineFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="stage" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                className="capitalize"
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#flowGradient)"
                fill="url(#flowGradient)"
                strokeWidth={3}
              />
              <defs>
                <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="20%" stopColor="#3b82f6" />
                  <stop offset="40%" stopColor="#6366f1" />
                  <stop offset="60%" stopColor="#8b5cf6" />
                  <stop offset="80%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold text-gradient mb-2">{content.length}</p>
          <p className="text-gray-400">Total Content</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold text-gradient mb-2">
            {content.filter(c => c.stage === 'publish').length}
          </p>
          <p className="text-gray-400">Published</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold text-gradient mb-2">
            {Math.round(content.reduce((acc, c) => acc + (c.attention_value || 0), 0) / content.length) || 0}
          </p>
          <p className="text-gray-400">Avg Quality</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold text-gradient mb-2">
            {new Set(content.map(c => c.platform)).size}
          </p>
          <p className="text-gray-400">Platforms</p>
        </div>
      </div>
    </div>
  );
}