import React from 'react';
import { Clock, Check, Edit, Upload, Eye } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'publish',
    content: 'Published "How to Build AI Apps" on YouTube',
    time: '2 hours ago',
    icon: Upload,
    color: 'text-emerald-400',
  },
  {
    id: 2,
    type: 'edit',
    content: 'Completed editing for Instagram Reel #47',
    time: '4 hours ago',
    icon: Edit,
    color: 'text-blue-400',
  },
  {
    id: 3,
    type: 'milestone',
    content: 'Reached 10K views on TikTok video',
    time: '6 hours ago',
    icon: Eye,
    color: 'text-violet-400',
  },
  {
    id: 4,
    type: 'task',
    content: 'Completed daily content planning',
    time: '8 hours ago',
    icon: Check,
    color: 'text-cyan-400',
  },
];

export function ActivityFeed() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
            <div className={`p-2 rounded-lg bg-gray-800/50 ${activity.color}`}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{activity.content}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Clock size={12} className="text-gray-500" />
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}