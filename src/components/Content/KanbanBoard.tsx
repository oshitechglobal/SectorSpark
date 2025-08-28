import React, { useRef, useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ContentPiece, ContentStage } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanScrollControls } from './KanbanScrollControls';

interface KanbanBoardProps {
  content: ContentPiece[];
  onDragEnd: (result: DropResult) => void;
  onCreateContent: (stage?: ContentStage) => void;
  onEditContent?: (content: ContentPiece) => void;
}

const stageConfig: Record<ContentStage, { title: string; description: string }> = {
  idea: { title: '💡 Ideas', description: 'Brainstorm and capture ideas' },
  outline: { title: '📝 Outline', description: 'Structure your content' },
  writing: { title: '✍️ Writing', description: 'Create the content' },
  design: { title: '🎨 Design', description: 'Visual elements and layout' },
  film: { title: '🎬 Filming', description: 'Record and capture' },
  edit: { title: '✂️ Editing', description: 'Polish and refine' },
  publish: { title: '🚀 Published', description: 'Live and published' },
};

export function KanbanBoard({ content, onDragEnd, onCreateContent, onEditContent }: KanbanBoardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const stages: ContentStage[] = ['idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'];

  const getContentByStage = (stage: ContentStage) => {
    return content.filter((item) => item.stage === stage);
  };

  const updateArrowVisibility = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -336, // Column width (320px) + gap (16px)
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 336, // Column width (320px) + gap (16px)
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const initialCheck = () => {
      setTimeout(updateArrowVisibility, 100);
    };

    initialCheck();
    container.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);

    const observer = new ResizeObserver(updateArrowVisibility);
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', updateArrowVisibility);
      window.removeEventListener('resize', updateArrowVisibility);
      observer.disconnect();
    };
  }, [content]);

  return (
    <div className="w-full relative">
      {/* Enhanced Container with Better Styling */}
      <div className="max-w-[1400px] mx-auto overflow-hidden bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/20 shadow-2xl">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Scroll Controls */}
          <KanbanScrollControls
            showLeftArrow={showLeftArrow}
            showRightArrow={showRightArrow}
            onScrollLeft={scrollLeft}
            onScrollRight={scrollRight}
          />

          {/* Kanban Columns Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 kanban-scroll"
            style={{ scrollBehavior: 'smooth' }}
          >
            {stages.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                title={stageConfig[stage].title}
                content={getContentByStage(stage)}
                onCreateContent={onCreateContent}
                onEditContent={onEditContent}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Stage Descriptions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stages.map((stage) => (
          <div key={stage} className="glass-card p-3 text-center">
            <p className="text-lg font-bold text-white">{getContentByStage(stage).length}</p>
            <p className="text-xs text-gray-400 capitalize">{stage}</p>
            <p className="text-xs text-gray-500 mt-1">{stageConfig[stage].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}