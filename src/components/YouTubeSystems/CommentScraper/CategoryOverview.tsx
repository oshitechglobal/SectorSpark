import React from 'react';

interface Category {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface CategoryOverviewProps {
  categories: Category[];
}

export function CategoryOverview({ categories }: CategoryOverviewProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Comment Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div 
            key={category.key} 
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200"
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <h4 className="font-semibold text-white text-sm leading-tight">{category.title}</h4>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}