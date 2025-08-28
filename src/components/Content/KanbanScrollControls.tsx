import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface KanbanScrollControlsProps {
  showLeftArrow: boolean;
  showRightArrow: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export function KanbanScrollControls({
  showLeftArrow,
  showRightArrow,
  onScrollLeft,
  onScrollRight,
}: KanbanScrollControlsProps) {
  return (
    <>
      {/* Left Scroll Arrow */}
      <button
        onClick={onScrollLeft}
        className={`absolute top-1/2 -translate-y-1/2 left-2 z-20 bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm rounded-full p-3 shadow-xl border border-gray-600/30 transition-all duration-300 ${
          showLeftArrow ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} className="text-white" />
      </button>

      {/* Right Scroll Arrow */}
      <button
        onClick={onScrollRight}
        className={`absolute top-1/2 -translate-y-1/2 right-2 z-20 bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm rounded-full p-3 shadow-xl border border-gray-600/30 transition-all duration-300 ${
          showRightArrow ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'
        }`}
        aria-label="Scroll right"
      >
        <ChevronRight size={20} className="text-white" />
      </button>
    </>
  );
}