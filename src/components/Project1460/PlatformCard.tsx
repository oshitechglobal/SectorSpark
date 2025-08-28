import React from 'react';
import { PlatformConfig, PlatformMetrics } from '../../types/progress';

interface PlatformCardProps {
  platform: PlatformConfig;
  metrics: PlatformMetrics;
  onChange: (metrics: PlatformMetrics) => void;
  disabled?: boolean;
}

export function PlatformCard({ platform, metrics, onChange, disabled }: PlatformCardProps) {
  const handleChange = (field: keyof PlatformMetrics, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    const newMetrics = { ...metrics, [field]: numValue };
    onChange(newMetrics);
  };

  const PlatformIcon = platform.icon;

  return (
    <div className={`glass-card p-6 transition-all duration-300 ${disabled ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
      {/* Platform Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-3 rounded-xl ${platform.bgGradient}`}>
          <PlatformIcon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
          <p className="text-sm text-gray-400">Daily metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {platform.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
            </label>
            <input
              type="number"
              min="0"
              value={metrics[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      {/* Current Values Display */}
      {Object.keys(metrics).length > 0 && Object.values(metrics).some(v => v !== undefined && v !== null) && (
        <div className="mt-6 pt-4 border-t border-gray-800/30">
          <p className="text-xs text-gray-500 mb-2">Current values:</p>
          <div className="flex flex-wrap gap-2">
            {platform.fields.map((field) => {
              const value = metrics[field.key];
              if (value === undefined || value === null) return null;
              
              return (
                <span
                  key={field.key}
                  className="text-xs bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full"
                >
                  {field.label}: {value.toLocaleString()}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}