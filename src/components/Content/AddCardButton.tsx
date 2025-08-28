import React from 'react';
import { Plus } from 'lucide-react';
import { ContentStage } from '../../types';

interface AddCardButtonProps {
  onClick: () => void;
  stage: ContentStage;
}

const stageEmojis = {
  idea: '💡',
  outline: '📝',
  writing: '✍️',
  design: '🎨',
  film: '🎬',
  edit: '✂️',
  publish: '🚀',
};

export function AddCardButton({ onClick, stage }: AddCardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-gray-400 hover:text-gray-200 text-sm flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/40 border-2 border-dashed border-gray-700/30 hover:border-gray-600/50 cursor-pointer transition-all duration-200 group backdrop-blur-sm"
    >
      <div className="flex items-center justify-center w-6 h-6 bg-gray-700/30 group-hover:bg-gray-600/40 rounded-lg transition-colors duration-200">
        <Plus size={14} className="group-hover:scale-110 transition-transform duration-200" />
      </div>
      <span className="font-medium">
        {stageEmojis[stage]} Add a card
      </span>
    </button>
  );
}