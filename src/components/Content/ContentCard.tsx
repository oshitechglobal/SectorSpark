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
  Mic
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentCardProps {
  content: ContentPiece;
}

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  linkedin: Linkedin,
  blog: FileText,
  podcast: Mic,
};

const platformColors = {
  youtube: 'text-red-500',
  instagram: 'text-pink-500',
  tiktok: 'text-gray-300',
  twitter: 'text-blue-400',
  linkedin: 'text-blue-600',
  blog: 'text-gray-400',
  podcast: 'text-purple-500',
};

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export function ContentCard({ content }: ContentCardProps) {
  const PlatformIcon = platformIcons[content.platform];

  return (
    <div className="glass-card p-4 hover:scale-105 transition-all duration-300 cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-white text-sm line-clamp-2">{content.title}</h4>
        <div className="flex items-center space-x-2">
          <PlatformIcon size={14} className={platformColors[content.platform]} />
          <Flag size={14} className={priorityColors[content.priority]} />
        </div>
      </div>
      
      {content.description && (
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{content.description}</p>
      )}
      
      {content.date && (
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Calendar size={12} />
          <span>{format(new Date(content.date), 'MMM d')}</span>
        </div>
      )}
    </div>
  );
}