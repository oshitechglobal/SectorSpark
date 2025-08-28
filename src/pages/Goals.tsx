import React from 'react';
import { Target, TrendingUp, Calendar, Award } from 'lucide-react';

export function Goals() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Goals & Milestones</h1>
        <p className="text-gray-400">Track your progress towards your creator goals.</p>
      </div>

      {/* Coming Soon */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="glass-card p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Goals Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              We're building powerful goal tracking features to help you achieve your creator milestones.
            </p>
            <div className="flex justify-center space-x-6 text-gray-500">
              <TrendingUp size={24} />
              <Calendar size={24} />
              <Award size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}