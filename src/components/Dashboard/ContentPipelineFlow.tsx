import React from 'react';
import { useContentPieces } from '../../hooks/useContentPieces';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ContentStage } from '../../types';

export function ContentPipelineFlow() {
  const { content } = useContentPieces();

  const pipelineData = React.useMemo(() => {
    const stages: ContentStage[] = ['idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'];
    
    return stages.map((stage, index) => {
      const count = content.filter(c => c.stage === stage).length;
      const flow = content.length > 0 ? (count / content.length) * 100 : 0;
      
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
        flow,
        efficiency: Math.max(0, 100 - (index * 10)), // Simulated efficiency drop through pipeline
      };
    });
  }, [content]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-cyan-400">
            Count: {payload[0].value}
          </p>
          <p className="text-violet-400">
            Flow: {payload[1]?.value?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Content Pipeline Flow</h3>
        <p className="text-sm text-gray-400">Real-time visualization of your content creation pipeline</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="stage" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Flow Area */}
            <Area
              type="monotone"
              dataKey="flow"
              stroke="url(#flowGradient)"
              fill="url(#flowGradient)"
              strokeWidth={3}
              fillOpacity={0.3}
            />
            
            {/* Count Area */}
            <Area
              type="monotone"
              dataKey="count"
              stroke="url(#countGradient)"
              fill="url(#countGradient)"
              strokeWidth={2}
              fillOpacity={0.2}
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
              <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">{content.length}</p>
          <p className="text-xs text-gray-400">Total Content</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">{content.filter(c => c.stage === 'publish').length}</p>
          <p className="text-xs text-gray-400">Published</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">
            {content.length > 0 ? Math.round((content.filter(c => c.stage === 'publish').length / content.length) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400">Success Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">
            {new Set(content.map(c => c.platform)).size}
          </p>
          <p className="text-xs text-gray-400">Platforms</p>
        </div>
      </div>
    </div>
  );
}