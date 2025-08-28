import React, { useState } from 'react';
import { VideoAnalyzer } from '../components/YouTubeSystems/VideoAnalyzer';
import { CommentScraper } from '../components/YouTubeSystems/CommentScraper';
import { ChaptersGenerator } from '../components/YouTubeSystems/ChaptersGenerator';
import { Youtube, BarChart3, MessageSquare, List } from 'lucide-react';

type ToolType = 'analyzer' | 'scraper' | 'chapters';

const tools = [
  {
    id: 'analyzer' as ToolType,
    name: 'Video Analyzer',
    description: 'Analyze YouTube video performance, engagement metrics, and optimization opportunities',
    icon: BarChart3,
    color: 'from-red-500 to-orange-500',
    features: ['Performance metrics', 'SEO analysis', 'Engagement insights', 'Optimization tips']
  },
  {
    id: 'scraper' as ToolType,
    name: 'Comment Scraper',
    description: 'Extract and analyze comments from YouTube videos for insights and engagement',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    features: ['Comment extraction', 'Sentiment analysis', 'Keyword insights', 'Export options']
  },
  {
    id: 'chapters' as ToolType,
    name: 'Chapters Generator',
    description: 'Automatically generate YouTube chapters and timestamps for better video navigation',
    icon: List,
    color: 'from-purple-500 to-pink-500',
    features: ['Auto timestamps', 'Chapter titles', 'Description format', 'Copy to clipboard']
  }
];

export function YouTubeSystems() {
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);

  const renderTool = () => {
    switch (selectedTool) {
      case 'analyzer':
        return <VideoAnalyzer onBack={() => setSelectedTool(null)} />;
      case 'scraper':
        return <CommentScraper onBack={() => setSelectedTool(null)} />;
      case 'chapters':
        return <ChaptersGenerator onBack={() => setSelectedTool(null)} />;
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
          <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl">
            <Youtube size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">YouTube Systems</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Powerful tools to analyze, optimize, and enhance your YouTube content creation workflow. 
          Choose a tool below to get started.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
        <h3 className="text-xl font-semibold text-white mb-4">More Tools Coming Soon</h3>
        <p className="text-gray-400 mb-6">
          We're continuously building new YouTube optimization tools to help creators succeed.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Thumbnail Analyzer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Title Optimizer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Tag Generator</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
            <span>Competitor Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}