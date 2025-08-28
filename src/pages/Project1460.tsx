import React, { useState } from 'react';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { PlatformCard } from '../components/Project1460/PlatformCard';
import { ProgressCalendar } from '../components/Project1460/ProgressCalendar';
import { GrowthTrendsChart } from '../components/Project1460/GrowthTrendsChart';
import { LatestNumbersChart } from '../components/Project1460/LatestNumbersChart';
import { ProgressHistoryTable } from '../components/Project1460/ProgressHistoryTable';
import { ProgressStats } from '../components/Project1460/ProgressStats';
import { PlatformConfig, PlatformType, PlatformMetrics } from '../types/progress';
import { ChevronLeft, ChevronRight, RefreshCw, Save, Loader2 } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { Youtube, Users, Linkedin, Instagram, Twitter, Mail } from 'lucide-react';

type TabType = 'entry' | 'calendar' | 'analytics' | 'history';

const platformConfigs: PlatformConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-400',
    bgGradient: 'bg-gradient-to-r from-red-500 to-red-600',
    fields: [
      { key: 'longFormVideos', label: 'Long-form Videos', placeholder: 'Number of videos posted' },
      { key: 'shorts', label: 'Shorts', placeholder: 'Number of shorts posted' },
      { key: 'subscribers', label: 'Subscribers', placeholder: 'Current subscriber count' },
    ],
  },
  {
    id: 'skool',
    name: 'Skool',
    icon: Users,
    color: 'text-purple-400',
    bgGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
    fields: [
      { key: 'members', label: 'Members', placeholder: 'Current member count' },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-400',
    bgGradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
    fields: [
      { key: 'posts', label: 'Posts', placeholder: 'Number of posts' },
      { key: 'followers', label: 'Followers', placeholder: 'Current follower count' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bgGradient: 'bg-gradient-to-r from-pink-500 to-purple-600',
    fields: [
      { key: 'posts', label: 'Posts', placeholder: 'Number of posts' },
      { key: 'followers', label: 'Followers', placeholder: 'Current follower count' },
    ],
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-blue-400',
    bgGradient: 'bg-gradient-to-r from-blue-400 to-blue-500',
    fields: [
      { key: 'posts', label: 'Posts', placeholder: 'Number of posts/tweets' },
      { key: 'followers', label: 'Followers', placeholder: 'Current follower count' },
    ],
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'text-green-400',
    bgGradient: 'bg-gradient-to-r from-green-500 to-green-600',
    fields: [
      { key: 'emailSubscribers', label: 'Subscribers', placeholder: 'Current subscriber count' },
    ],
  },
];

export function Project1460() {
  const {
    progressData,
    loading,
    error,
    getProgressForDateAndPlatform,
    saveProgressEntry,
    getProgressStats,
    getGrowthTrendData,
    refetch,
  } = useDailyProgress();

  const [activeTab, setActiveTab] = useState<TabType>('entry');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for all platforms
  const [formData, setFormData] = useState<Record<PlatformType, PlatformMetrics>>(() => {
    const initialData = {} as Record<PlatformType, PlatformMetrics>;
    platformConfigs.forEach(platform => {
      initialData[platform.id] = {};
    });
    return initialData;
  });

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const stats = getProgressStats();
  const growthData = getGrowthTrendData(timeRange);

  // Load existing data when date changes
  React.useEffect(() => {
    const newFormData = {} as Record<PlatformType, PlatformMetrics>;
    platformConfigs.forEach(platform => {
      const existingEntry = getProgressForDateAndPlatform(selectedDateString, platform.id);
      newFormData[platform.id] = existingEntry?.metrics || {};
    });
    setFormData(newFormData);
  }, [selectedDateString, getProgressForDateAndPlatform]);

  const handlePlatformChange = (platform: PlatformType, metrics: PlatformMetrics) => {
    setFormData(prev => ({
      ...prev,
      [platform]: metrics
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Save all platforms that have data
      const savePromises = platformConfigs.map(async (platform) => {
        const metrics = formData[platform.id];
        const hasData = Object.values(metrics).some(value => value !== undefined && value !== null && value !== '');
        
        if (hasData) {
          return saveProgressEntry(selectedDateString, platform.id, metrics);
        }
        return null;
      });

      await Promise.all(savePromises);
      
      // Show success feedback (you could add a toast notification here)
      console.log('All metrics saved successfully!');
    } catch (err) {
      console.error('Failed to save metrics:', err);
      // Show error feedback (you could add a toast notification here)
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  // Check if there are any changes to save
  const hasChanges = React.useMemo(() => {
    return platformConfigs.some(platform => {
      const currentMetrics = formData[platform.id];
      const existingEntry = getProgressForDateAndPlatform(selectedDateString, platform.id);
      const existingMetrics = existingEntry?.metrics || {};
      
      return platform.fields.some(field => {
        const currentValue = currentMetrics[field.key];
        const existingValue = existingMetrics[field.key];
        return currentValue !== existingValue;
      });
    });
  }, [formData, selectedDateString, getProgressForDateAndPlatform]);

  const tabs = [
    { id: 'entry' as TabType, label: "Today's Entry", icon: '📝' },
    { id: 'calendar' as TabType, label: 'Calendar', icon: '📅' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: '📊' },
    { id: 'history' as TabType, label: 'History', icon: '📋' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Progress</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Project 1460</h1>
          <p className="text-gray-400">
            Track your daily progress for 1460 days of consistent creation.
            {stats.totalDays > 0 && (
              <span className="ml-2 text-cyan-400">
                Day {stats.totalDays} of 1460 • {stats.currentStreak} day streak
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Progress Stats */}
      <ProgressStats stats={stats} />

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 glass-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Calendar Navigation (for calendar tab) */}
      {activeTab === 'calendar' && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="btn-secondary flex items-center space-x-2"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <span className="text-white font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'entry' && (
          <div className="space-y-8">
            {/* Date Selection and Save Button */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Daily Entry for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="date"
                      value={selectedDateString}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="btn-secondary text-sm"
                    >
                      Today
                    </button>
                  </div>
                </div>
                
                {/* Save All Button */}
                <button
                  onClick={handleSaveAll}
                  disabled={!hasChanges || isSaving}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    hasChanges && !isSaving
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save All Metrics'}</span>
                </button>
              </div>
              
              {hasChanges && !isSaving && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4">
                  <p className="text-cyan-400 text-sm">
                    💡 You have unsaved changes. Click "Save All Metrics" to save your progress.
                  </p>
                </div>
              )}
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformConfigs.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  metrics={formData[platform.id]}
                  onChange={(metrics) => handlePlatformChange(platform.id, metrics)}
                  disabled={isSaving}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <ProgressCalendar
            currentDate={currentDate}
            progressData={progressData}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GrowthTrendsChart
                data={growthData}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
              <LatestNumbersChart stats={stats} />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <ProgressHistoryTable progressData={progressData} />
        )}
      </div>

      {/* Empty State */}
      {progressData.length === 0 && activeTab === 'entry' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Start Your 1460 Day Journey</h3>
          <p className="text-gray-400 mb-6">
            Begin tracking your daily progress across all platforms to build consistency and achieve your creator goals.
          </p>
        </div>
      )}
    </div>
  );
}