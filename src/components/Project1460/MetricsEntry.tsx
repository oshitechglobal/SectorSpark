import React, { useState } from 'react';
import { DailyProgress } from '../../types';
import { Save } from 'lucide-react';

interface MetricsEntryProps {
  selectedDate: Date;
  existingProgress?: DailyProgress;
  onSave: (progress: Omit<DailyProgress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}

export function MetricsEntry({ selectedDate, existingProgress, onSave }: MetricsEntryProps) {
  const [metrics, setMetrics] = useState({
    videos_posted: existingProgress?.videos_posted || 0,
    shorts_posted: existingProgress?.shorts_posted || 0,
    reels_posted: existingProgress?.reels_posted || 0,
    tiktoks_posted: existingProgress?.tiktoks_posted || 0,
    tweets_posted: existingProgress?.tweets_posted || 0,
    linkedin_posts: existingProgress?.linkedin_posts || 0,
    blog_posts: existingProgress?.blog_posts || 0,
    podcast_episodes: existingProgress?.podcast_episodes || 0,
    total_views: existingProgress?.total_views || 0,
    total_likes: existingProgress?.total_likes || 0,
    total_comments: existingProgress?.total_comments || 0,
    total_shares: existingProgress?.total_shares || 0,
    subscriber_growth: existingProgress?.subscriber_growth || 0,
    revenue_generated: existingProgress?.revenue_generated || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: selectedDate.toISOString().split('T')[0],
      ...metrics,
    });
  };

  const handleChange = (field: keyof typeof metrics, value: number) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  const inputGroups = [
    {
      title: 'Content Posted',
      fields: [
        { key: 'videos_posted', label: 'Videos' },
        { key: 'shorts_posted', label: 'Shorts' },
        { key: 'reels_posted', label: 'Reels' },
        { key: 'tiktoks_posted', label: 'TikToks' },
        { key: 'tweets_posted', label: 'Tweets' },
        { key: 'linkedin_posts', label: 'LinkedIn' },
        { key: 'blog_posts', label: 'Blogs' },
        { key: 'podcast_episodes', label: 'Podcasts' },
      ]
    },
    {
      title: 'Engagement Metrics',
      fields: [
        { key: 'total_views', label: 'Total Views' },
        { key: 'total_likes', label: 'Total Likes' },
        { key: 'total_comments', label: 'Comments' },
        { key: 'total_shares', label: 'Shares' },
      ]
    },
    {
      title: 'Growth & Revenue',
      fields: [
        { key: 'subscriber_growth', label: 'Subscriber Growth' },
        { key: 'revenue_generated', label: 'Revenue ($)' },
      ]
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">
        Metrics for {selectedDate.toLocaleDateString()}
      </h3>

      <div className="space-y-8">
        {inputGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-medium text-gray-300 mb-4">{group.title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {group.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-400 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metrics[field.key as keyof typeof metrics]}
                    onChange={(e) => handleChange(field.key as keyof typeof metrics, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="btn-primary w-full mt-8 flex items-center justify-center space-x-2"
      >
        <Save size={18} />
        <span>Save Progress</span>
      </button>
    </form>
  );
}