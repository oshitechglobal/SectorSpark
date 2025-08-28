import React, { useState } from 'react';
import { Copy, Download, MessageSquare, Info, Eye, Filter } from 'lucide-react';
import { CommentScraping, useCommentScraping } from '../../../hooks/useCommentScraping';
import { CategoryPopup } from './CategoryPopup';

interface Category {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface CategoryResultsProps {
  scraping: CommentScraping;
  categories: Category[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onExportCategory: (category: string[], categoryTitle: string) => void;
  onCopyCategory: (category: string[]) => void;
}

export function CategoryResults({
  scraping,
  categories,
  selectedFilter,
  onFilterChange,
  onExportCategory,
  onCopyCategory
}: CategoryResultsProps) {
  const { getCommentsArray, getTotalComments } = useCommentScraping();
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [copiedCategory, setCopiedCategory] = useState<string>('');

  const handleCopyCategory = async (comments: string[], categoryKey: string) => {
    await onCopyCategory(comments);
    setCopiedCategory(categoryKey);
    setTimeout(() => setCopiedCategory(''), 2000);
  };

  const handleViewAllCategories = () => {
    setShowCategoryPopup(true);
  };

  // Get category data with comments
  const categoryData = categories.map(category => ({
    ...category,
    comments: getCommentsArray(scraping[category.key as keyof CommentScraping] as string)
  }));

  const totalCategorizedComments = getTotalComments(scraping);

  return (
    <div className="space-y-6">
      {/* Results Overview Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-2">Categorized Comments</h3>
            <p className="text-gray-400">
              AI has analyzed and categorized {totalCategorizedComments} comments from your video
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCategoryPopup(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Info size={16} />
              <span>Category Info</span>
            </button>
            <button
              onClick={handleViewAllCategories}
              className="btn-primary flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>View All Categories</span>
            </button>
          </div>
        </div>

        {/* Category Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.map((category) => (
            <div
              key={category.key}
              onClick={() => onFilterChange(category.key)}
              className={`relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                selectedFilter === category.key
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    category.comments.length > 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-gray-700/50 text-gray-500'
                  }`}>
                    {category.comments.length}
                  </div>
                </div>
                
                <h4 className="font-bold text-white text-sm mb-2 leading-tight">
                  {category.title}
                </h4>
                
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {category.description}
                </p>

                {/* Preview of first comment if available */}
                {category.comments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/30">
                    <p className="text-gray-300 text-xs italic line-clamp-2">
                      "{category.comments[0].substring(0, 80)}..."
                    </p>
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {selectedFilter === category.key && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            All Categories ({totalCategorizedComments})
          </button>
          {categoryData.filter(cat => cat.comments.length > 0).map((category) => (
            <button
              key={category.key}
              onClick={() => onFilterChange(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedFilter === category.key
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {category.icon} {category.title} ({category.comments.length})
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Category Display */}
      {selectedFilter !== 'all' && (
        <div className="space-y-6">
          {categoryData
            .filter(category => category.key === selectedFilter && category.comments.length > 0)
            .map((category) => (
              <div key={category.key} className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color}`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{category.title}</h4>
                      <p className="text-gray-400 text-sm">{category.description}</p>
                      <p className="text-cyan-400 text-sm mt-1">{category.comments.length} comments found</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCategory(category.comments, category.key)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Copy size={14} />
                      <span>{copiedCategory === category.key ? 'Copied!' : 'Copy All'}</span>
                    </button>
                    <button
                      onClick={() => onExportCategory(category.comments, category.title)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {category.comments.map((comment: string, index: number) => (
                    <div key={index} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 hover:bg-gray-800/60 transition-colors shadow-md">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                            <MessageSquare size={16} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{comment}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <MessageSquare size={12} />
                              <span>Comment {index + 1} of {category.comments.length}</span>
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(comment)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* All Categories View */}
      {selectedFilter === 'all' && (
        <div className="space-y-6">
          {categoryData
            .filter(category => category.comments.length > 0)
            .map((category) => (
              <div key={category.key} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="text-lg font-bold text-cyan-400">{category.title}</h4>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                    <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                      {category.comments.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCategory(category.comments, category.key)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Copy size={14} />
                      <span>{copiedCategory === category.key ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onExportCategory(category.comments, category.title)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Download size={14} />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => onFilterChange(category.key)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
                
                {/* Preview of first 3 comments */}
                <div className="space-y-3">
                  {category.comments.slice(0, 3).map((comment: string, index: number) => (
                    <div key={index} className="bg-gray-800/30 rounded-lg p-3 shadow-md">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <MessageSquare size={14} className="text-cyan-400" />
                        </div>
                        <p className="text-gray-200 text-sm leading-relaxed flex-1 line-clamp-2 whitespace-pre-wrap">
                          {comment}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {category.comments.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => onFilterChange(category.key)}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      >
                        View all {category.comments.length} comments →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {totalCategorizedComments === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Comments Categorized</h4>
          <p className="text-gray-400">
            The AI analysis is still in progress or no comments matched the categories. 
            Please check back in a few minutes.
          </p>
        </div>
      )}

      {/* Category Information Popup */}
      <CategoryPopup
        isOpen={showCategoryPopup}
        onClose={() => setShowCategoryPopup(false)}
        categories={categories}
      />
    </div>
  );
}