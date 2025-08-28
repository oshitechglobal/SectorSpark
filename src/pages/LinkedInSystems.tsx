import React, { useState } from 'react';
import { LatestAINews } from '../components/LinkedInSystems/LatestAINews';
import { LinkedInPostIdeas } from '../components/LinkedInSystems/LinkedInPostIdeas';
import { Linkedin, Newspaper, Lightbulb } from 'lucide-react';

type ToolType = 'news' | 'post-ideas';

const tools = [
  {
    id: 'news' as ToolType,
    name: 'Latest AI News',
    description: 'Get the latest AI news, trends, and developments curated for LinkedIn content creation',
    icon: Newspaper,
    color: 'from-blue-500 to-cyan-500',
    features: ['Breaking AI news', 'Industry trends', 'Company updates', 'Research highlights']
  },
  {
    id: 'post-ideas' as ToolType,
    name: 'LinkedIn Post Ideas',
    description: 'Generate engaging LinkedIn post ideas based on AI trends and your niche',
    icon: Lightbulb,
    color: 'from-purple-500 to-pink-500',
    features: ['Post templates', 'Trending topics', 'Engagement hooks', 'Content formats']
  }
];

export function LinkedInSystems() {
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);

  const renderTool = () => {
    switch (selectedTool) {
      case 'news':
        return <LatestAINews onBack={() => setSelectedTool(null)} />;
      case 'post-ideas':
        return <LinkedInPostIdeas onBack={() => setSelectedTool(null)} />;
      default:
        return null;
    }
  };

  if (selectedTool) {
    return renderTool();
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl">
            <Linkedin size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">LinkedIn Systems</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Powerful tools to enhance your LinkedIn presence with AI-powered content creation and news curation. 
          Choose a tool below to get started.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          
          return (
            <div
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className="glass-card p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 group"
            >
              {/* Tool Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={32} className="text-white" />
              </div>

              {/* Tool Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-all duration-300">
                  {tool.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Features</p>
                <ul className="space-y-1">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Coming Soon Features */}
      <div className="glass-card p-8 text-center max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-white mb-4">More LinkedIn Tools Coming Soon</h3>
        <p className="text-gray-400 mb-6">
          We're continuously building new LinkedIn optimization tools to help professionals succeed.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Connection Tracker</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Engagement Analytics</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Profile Optimizer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Content Scheduler</span>
          </div>
        </div>
      </div>
    </div>
  );
}