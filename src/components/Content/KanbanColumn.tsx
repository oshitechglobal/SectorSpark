import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ContentPiece, ContentStage } from '../../types';
import { TrelloCard } from './TrelloCard';
import { AddCardButton } from './AddCardButton';
import { MoreHorizontal, Plus } from 'lucide-react';

interface KanbanColumnProps {
  stage: ContentStage;
  title: string;
  content: ContentPiece[];
  onCreateContent: (stage: ContentStage) => void;
  onEditContent?: (content: ContentPiece) => void;
}

const stageColors = {
  idea: 'from-amber-500/20 to-orange-500/10',
  outline: 'from-blue-500/20 to-indigo-500/10',
  writing: 'from-indigo-500/20 to-purple-500/10',
  design: 'from-purple-500/20 to-pink-500/10',
  film: 'from-pink-500/20 to-rose-500/10',
  edit: 'from-emerald-500/20 to-teal-500/10',
  publish: 'from-cyan-500/20 to-blue-500/10',
};

export function KanbanColumn({ stage, title, content, onCreateContent, onEditContent }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${stageColors[stage]} backdrop-blur-sm rounded-t-xl px-4 py-4 border-b border-gray-700/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-semibold text-gray-100">
              {title}
            </h3>
            <span className="text-xs bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full font-medium">
              {content.length}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-700/30 rounded-lg transition-colors duration-200">
            <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-200" />
          </button>
        </div>
      </div>

      {/* Column Body */}
      <div className="bg-gray-900/30 backdrop-blur-sm rounded-b-xl p-4 min-h-[600px] border-l border-r border-b border-gray-700/20">
        <Droppable droppableId={stage}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[520px] transition-all duration-300 ${
                snapshot.isDraggingOver 
                  ? 'bg-gradient-to-b from-cyan-500/10 to-violet-500/10 rounded-xl p-3 border-2 border-dashed border-cyan-400/30' 
                  : ''
              }`}
            >
              <div className="space-y-4 mb-4">
                {content.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-all duration-200 ${
                          snapshot.isDragging 
                            ? 'rotate-2 scale-105 z-50 shadow-2xl shadow-black/40' 
                            : 'hover:rotate-1'
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          // Fix the drag offset issue
                          transform: snapshot.isDragging 
                            ? `${provided.draggableProps.style?.transform} rotate(2deg) scale(1.05)`
                            : provided.draggableProps.style?.transform,
                        }}
                      >
                        <TrelloCard 
                          content={item} 
                          onClick={onEditContent}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
              {provided.placeholder}
              
              {/* Add Card Button */}
              <AddCardButton 
                onClick={() => onCreateContent(stage)}
                stage={stage}
              />
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}