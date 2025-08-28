import React from 'react';
import { RealTimeMetrics } from '../components/Dashboard/RealTimeMetrics';
import { ContentPipelineFlow } from '../components/Dashboard/ContentPipelineFlow';
import { PlatformDistribution } from '../components/Dashboard/PlatformDistribution';
import { SystemsOverview } from '../components/Dashboard/SystemsOverview';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { ProgressHeatmap } from '../components/Dashboard/ProgressHeatmap';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-400">
          Here's your creator overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Real-Time Metrics */}
      <RealTimeMetrics />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Pipeline Flow - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ContentPipelineFlow />
        </div>
        
        {/* Platform Distribution */}
        <div className="lg:col-span-1">
          <PlatformDistribution />
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Systems Overview */}
        <SystemsOverview />
        
        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Progress Heatmap - Full Width */}
      <ProgressHeatmap />

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-secondary flex flex-col items-center space-y-2 py-4">
            <span className="text-2xl">📝</span>
            <span className="text-sm">New Content</span>
          </button>
          <button className="btn-secondary flex flex-col items-center space-y-2 py-4">
            <span className="text-2xl">📊</span>
            <span className="text-sm">Log Progress</span>
          </button>
          <button className="btn-secondary flex flex-col items-center space-y-2 py-4">
            <span className="text-2xl">🎬</span>
            <span className="text-sm">Analyze Video</span>
          </button>
          <button className="btn-secondary flex flex-col items-center space-y-2 py-4">
            <span className="text-2xl">💰</span>
            <span className="text-sm">Revenue Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}