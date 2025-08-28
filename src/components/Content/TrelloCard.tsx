import React from 'react';
import { ContentPiece } from '../../types';
import { 
  Calendar, 
  Flag, 
  Youtube, 
  Instagram, 
  Music, 
  Twitter, 
  Linkedin,
  FileText,
  Mic,
  Eye,
  Heart,
  Share2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface TrelloCardProps {
  content: ContentPiece;
  onClick?: (content: ContentPiece) => void;
}

const platformConfig = {
  youtube: {
    icon: Youtube,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400',
    bgGradient: 'from-red-500/10 to-red-600/5'
  },
  instagram: {
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600',
    borderColor: 'border-pink-500/20',
    textColor: 'text-pink-400',
    bgGradient: 'from-purple-500/10 to-pink-500/5'
  },
  tiktok: {
    icon: Music,
    color: 'bg-gray-900',
    hoverColor: 'hover:bg-black',
    borderColor: 'border-gray-500/20',
    textColor: 'text-gray-300',
    bgGradient: 'from-gray-800/10 to-gray-900/5'
  },
  twitter: {
    icon: Twitter,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    bgGradient: 'from-blue-500/10 to-blue-600/5'
  },
  linkedin: {
    icon: Linkedin,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    borderColor: 'border-blue-600/20',
    textColor: 'text-blue-400',
    bgGradient: 'from-blue-600/10 to-blue-700/5'
  },
  blog: {
    icon: FileText,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    borderColor: 'border-gray-500/20',
    textColor: 'text-gray-400',
    bgGradient: 'from-gray-600/10 to-gray-700/5'
  },
  podcast: {
    icon: Mic,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    bgGradient: 'from-purple-600/10 to-purple-700/5'
  },
};

const priorityConfig = {
  low: { color: 'bg-gray-500', text: 'Low' },
  medium: { color: 'bg-yellow-500', text: 'Medium' },
  high: { color: 'bg-orange-500', text: 'High' },
  urgent: { color: 'bg-red-500', text: 'Urgent' },
};

export function TrelloCard({ content, onClick }: TrelloCardProps) {
  const platform = platformConfig[content.platform];
  const PlatformIcon = platform.icon;
  const priority = priorityConfig[content.priority];

  const hasMedia = content.video_url || content.thumbnail_url;
  const hasContent = content.hook || content.outline;
  const isHighValue = content.attention_value && parseInt(content.attention_value) > 7;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when dragging
    if (e.defaultPrevented) return;
    
    onClick?.(content);
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        relative bg-gradient-to-br ${platform.bgGradient} 
        hover:shadow-xl hover:shadow-black/20
        rounded-xl p-4 border ${platform.borderColor}
        transform hover:-translate-y-1 hover:scale-[1.02]
        transition-all duration-300 ease-out
        cursor-pointer group
        min-h-[140px]
        backdrop-blur-sm
        select-none
      `}
    >
      {/* High Value Indicator */}
      {isHighValue && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-pulse shadow-lg" />
      )}

      {/* Header with Platform and Priority */}
      <div className="flex items-center justify-between mb-3">
        <div className={`${platform.color} ${platform.hoverColor} rounded-lg p-2 transition-colors duration-200`}>
          <PlatformIcon size={16} className="text-white" />
        </div>
        <div className="flex items-center space-x-2">
          {content.will_share && (
            <div className="bg-emerald-500/20 text-emerald-400 rounded-full p-1">
              <Share2 size={10} />
            </div>
          )}
          <div className={`${priority.color} w-2 h-2 rounded-full`} title={priority.text} />
        </div>
      </div>
      
      {/* Card Title */}
      <h4 className="font-semibold text-gray-100 mb-3 text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
        {content.title}
      </h4>
      
      {/* Card Description or Hook */}
      {(content.description || content.hook) && (
        <p className="text-gray-300 text-xs mb-3 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-200">
          {content.hook || content.description}
        </p>
      )}

      {/* Content Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {hasMedia && (
            <div className="bg-gray-700/50 text-gray-300 rounded-full p-1" title="Has media">
              <Eye size={10} />
            </div>
          )}
          {hasContent && (
            <div className="bg-gray-700/50 text-gray-300 rounded-full p-1" title="Has content">
              <FileText size={10} />
            </div>
          )}
          {content.lead_magnets && content.lead_magnets.length > 0 && (
            <div className="bg-cyan-500/20 text-cyan-400 rounded-full p-1" title="Has lead magnets">
              <Heart size={10} />
            </div>
          )}
        </div>
        
        {/* Attention Value */}
        {content.attention_value && (
          <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
            {content.attention_value}/10
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs">
        {/* Due Date */}
        {(content.due_date || content.date) && (
          <div className="flex items-center gap-1 text-gray-400 bg-gray-800/30 px-2 py-1 rounded-full">
            <Calendar size={10} />
            <span>{format(new Date(content.due_date || content.date!), 'MMM d')}</span>
          </div>
        )}
        
        {/* Created Time */}
        <div className="flex items-center gap-1 text-gray-500">
          <Clock size={10} />
          <span>{format(new Date(content.created_at), 'MMM d')}</span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
}