import React from 'react';
import { X, MessageSquare, Brain, Target, AlertTriangle, DollarSign, FileText } from 'lucide-react';

interface Category {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export function CategoryPopup({ isOpen, onClose, categories }: CategoryPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-800/30 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-2">AI Comment Categories</h2>
              <p className="text-gray-400">
                Our advanced AI system categorizes YouTube comments into 6 specific categories for actionable insights
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <X size={24} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <div 
                key={category.key}
                className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${category.color} bg-opacity-10 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group`}
              >
                {/* Category Number Badge */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>

                {/* Category Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>

                {/* Category Title */}
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {category.title}
                </h3>

                {/* Category Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Examples Section */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
                    Example Comments:
                  </p>
                  <div className="space-y-2">
                    {getExampleComments(category.key).map((example, idx) => (
                      <div key={idx} className="text-xs text-gray-300 bg-black/20 rounded-lg p-3 border border-white/5">
                        <span className="text-gray-500">"</span>
                        <span className="italic">{example}</span>
                        <span className="text-gray-500">"</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                    Use This For:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getUseCases(category.key).map((useCase, idx) => (
                      <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-300`} />
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <div className="glass-card p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">How AI Categorization Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">1. Extract</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Scrape comments from your YouTube video using advanced parsing
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">2. Analyze</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI analyzes context, intent, and sentiment of each comment
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">3. Categorize</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Smart categorization into 6 actionable business categories
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">4. Deliver</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Organized results ready for content planning and strategy
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-2xl p-8 border border-cyan-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Use AI Comment Categorization?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Content Strategy</h4>
                  <p className="text-gray-400 text-sm">Discover exactly what your audience wants to see next</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Tool Insights</h4>
                  <p className="text-gray-400 text-sm">Identify which AI tools your audience needs most</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Pain Point Analysis</h4>
                  <p className="text-gray-400 text-sm">Understand problems and create solutions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-rose-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Business Intelligence</h4>
                  <p className="text-gray-400 text-sm">Learn how people monetize AI tools</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Competitive Analysis</h4>
                  <p className="text-gray-400 text-sm">See what tools people compare yours to</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Audience Engagement</h4>
                  <p className="text-gray-400 text-sm">Create content that directly addresses requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="glass-card p-6 bg-gray-800/30">
            <h3 className="text-lg font-bold text-white mb-4">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-cyan-400 mb-2">Processing Time</h4>
                <p className="text-gray-400">1-5 minutes depending on comment volume</p>
              </div>
              <div>
                <h4 className="font-medium text-cyan-400 mb-2">Accuracy Rate</h4>
                <p className="text-gray-400">95%+ accuracy with advanced NLP models</p>
              </div>
              <div>
                <h4 className="font-medium text-cyan-400 mb-2">Comment Limit</h4>
                <p className="text-gray-400">Up to 1,000 comments per video</p>
              </div>
              <div>
                <h4 className="font-medium text-cyan-400 mb-2">Export Options</h4>
                <p className="text-gray-400">CSV export and clipboard copy available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to provide example comments for each category
function getExampleComments(categoryKey: string): string[] {
  const examples = {
    most_requested_ai_tools: [
      "Can you review Claude 3.5 Sonnet next?",
      "Please make a video about Midjourney v6!"
    ],
    ai_tool_comparisons: [
      "How does ChatGPT compare to Claude?",
      "Which is better: Notion AI or Obsidian?"
    ],
    use_cases_applications: [
      "How can I use AI for my marketing agency?",
      "Can AI help with financial analysis?"
    ],
    problems_complaints: [
      "These AI tools are too expensive for startups",
      "The accuracy isn't good enough for production"
    ],
    ai_business_monetization: [
      "How to start an AI automation agency?",
      "Best ways to make money with AI in 2024?"
    ],
    content_requests_suggestions: [
      "Please make a beginner's guide to prompt engineering",
      "Can you cover AI ethics in your next video?"
    ]
  };

  return examples[categoryKey as keyof typeof examples] || [];
}

// Helper function to provide use cases for each category
function getUseCases(categoryKey: string): string[] {
  const useCases = {
    most_requested_ai_tools: ["Content Planning", "Tool Reviews", "Market Research"],
    ai_tool_comparisons: ["Competitive Analysis", "Feature Comparison", "User Preferences"],
    use_cases_applications: ["Industry Insights", "Solution Development", "Tutorial Ideas"],
    problems_complaints: ["Product Improvement", "Support Content", "FAQ Creation"],
    ai_business_monetization: ["Business Strategy", "Revenue Ideas", "Market Opportunities"],
    content_requests_suggestions: ["Content Calendar", "Audience Engagement", "Topic Research"]
  };

  return useCases[categoryKey as keyof typeof useCases] || [];
}