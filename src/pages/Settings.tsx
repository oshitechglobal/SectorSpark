import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-gray-400">Customize your Infinitum experience.</p>
      </div>

      {/* Coming Soon */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="glass-card p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SettingsIcon size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Settings Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              We're building comprehensive settings to personalize your dashboard and preferences.
            </p>
            <div className="flex justify-center space-x-6 text-gray-500">
              <User size={24} />
              <Bell size={24} />
              <Shield size={24} />
              <Palette size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}