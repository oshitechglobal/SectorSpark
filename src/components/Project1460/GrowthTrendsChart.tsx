import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GrowthTrendData } from '../../types/progress';
import { format } from 'date-fns';

interface GrowthTrendsChartProps {
  data: GrowthTrendData[];
  timeRange: number;
  onTimeRangeChange: (days: number) => void;
}

const platformConfig = {
  youtubeSubscribers: { color: '#ff0000', name: 'YouTube Subscribers' },
  skoolMembers: { color: '#8b5cf6', name: 'Skool Members' },
  linkedinFollowers: { color: '#0077b5', name: 'LinkedIn Followers' },
  instagramFollowers: { color: '#e1306c', name: 'Instagram Followers' },
  twitterFollowers: { color: '#1da1f2', name: 'Twitter Followers' },
  emailSubscribers: { color: '#10b981', name: 'Email Subscribers' },
};

const timeRangeOptions = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 365, label: '1 Year' },
];

export function GrowthTrendsChart({ data, timeRange, onTimeRangeChange }: GrowthTrendsChartProps) {
  const formatTooltipValue = (value: any, name: string) => {
    const config = platformConfig[name as keyof typeof platformConfig];
    return [value?.toLocaleString() || '0', config?.name || name];
  };

  const formatTooltipLabel = (label: string) => {
    return format(new Date(label), 'MMM d, yyyy');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Growth Trends</h3>
          <p className="text-sm text-gray-400">Track your follower and subscriber growth over time</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === option.value
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={formatTooltipValue}
              labelFormatter={formatTooltipLabel}
            />
            <Legend
              wrapperStyle={{ color: '#9ca3af' }}
            />
            
            {Object.entries(platformConfig).map(([key, config]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
                connectNulls={false}
                name={config.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(platformConfig).map(([key, config]) => {
          const latestValue = data[data.length - 1]?.[key] as number;
          const previousValue = data[data.length - 2]?.[key] as number;
          const change = latestValue && previousValue ? latestValue - previousValue : 0;
          const changePercent = previousValue ? ((change / previousValue) * 100) : 0;
          
          return (
            <div key={key} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{config.name}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-white">
                    {latestValue?.toLocaleString() || '0'}
                  </span>
                  {change !== 0 && (
                    <span className={`text-xs ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {change > 0 ? '+' : ''}{change.toLocaleString()} ({changePercent.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}