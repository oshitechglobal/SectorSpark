import React, { useState } from 'react';
import { X, Copy, Download, Share2, Eye, TrendingUp, Users, MessageSquare, Target, Lightbulb, FileText, CheckCircle } from 'lucide-react';
import { LinkedInPostOutput, LinkedInPostsResponse, LinkedInPost } from '../../hooks/useAINews';

interface LinkedInPostViewerProps {
  isOpen: boolean;
  onClose: () => void;
  postOutput: LinkedInPostOutput | null;
}

export function LinkedInPostViewer({ isOpen, onClose, postOutput }: LinkedInPostViewerProps) {
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [copiedSection, setCopiedSection] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);

  if (!isOpen || !postOutput) return null;

  const response: LinkedInPostsResponse = postOutput.webhook_response;

  // Copy post content to clipboard
  const copyPost = async (post: LinkedInPost) => {
    const fullPost = `${post.full_post}

${post.hashtags.join(' ')}`;

    try {
      await navigator.clipboard.writeText(fullPost);
      setCopiedPostId(post.post_id);
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch (err) {
      console.error('Failed to copy post:', err);
    }
  };

  // Copy section content
  const copySection = async (content: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(''), 2000);
    } catch (err) {
      console.error('Failed to copy section:', err);
    }
  };

  // Download all posts as text file
  const downloadAllPosts = () => {
    const content = response.linkedin_posts.map((post, index) => 
      `POST ${index + 1}: ${post.title || post.format_type}
${post.full_post}

Hashtags: ${post.hashtags.join(' ')}
CTA Strategy: ${post.cta_strategy}
Target Metrics: ${post.target_metrics.join(', ')}

---

`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-posts-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-800/30 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-2">Generated LinkedIn Posts</h2>
              <p className="text-gray-400">
                AI-generated content strategy with {response.linkedin_posts?.length || 0} LinkedIn posts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadAllPosts}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Download All</span>
              </button>
              <button
                onClick={onClose}
                className="p-3 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Content Strategy Overview */}
          {response.content_strategy && (
            <div className="glass-card p-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Target size={20} className="text-cyan-400" />
                  <span>Content Strategy</span>
                </h3>
                <button
                  onClick={() => copySection(response.content_strategy.strategic_overview, 'strategy')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedSection === 'strategy' ? 'Copied!' : 'Copy Strategy'}</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">News Source</h4>
                  <p className="text-gray-200">{response.content_strategy.news_source}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Strategic Overview</h4>
                  <p className="text-gray-200 leading-relaxed">{response.content_strategy.strategic_overview}</p>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Posts Grid */}
          {response.linkedin_posts && response.linkedin_posts.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <MessageSquare size={24} className="text-violet-400" />
                <span>LinkedIn Posts ({response.linkedin_posts.length})</span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {response.linkedin_posts.map((post, index) => (
                  <div key={post.post_id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{post.format_type}</h4>
                          <p className="text-sm text-gray-400">{post.strategic_angle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPost(selectedPost?.post_id === post.post_id ? null : post)}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <Eye size={14} />
                          <span>{selectedPost?.post_id === post.post_id ? 'Hide' : 'View'}</span>
                        </button>
                        <button
                          onClick={() => copyPost(post)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          {copiedPostId === post.post_id ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Hook Preview */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700/30">
                      <h5 className="text-sm font-medium text-cyan-400 mb-2">Hook</h5>
                      <p className="text-gray-200 text-sm italic">"{post.hook}"</p>
                    </div>

                    {/* Post Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <h5 className="text-xs font-medium text-gray-400 mb-1">Target Metrics</h5>
                        <div className="flex flex-wrap gap-1">
                          {post.target_metrics.map((metric, idx) => (
                            <span key={idx} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <h5 className="text-xs font-medium text-gray-400 mb-1">CTA Strategy</h5>
                        <p className="text-xs text-gray-200">{post.cta_strategy}</p>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Expanded Post Content */}
                    {selectedPost?.post_id === post.post_id && (
                      <div className="mt-4 pt-4 border-t border-gray-700/30">
                        <h5 className="text-sm font-medium text-white mb-3">Full Post Content</h5>
                        <div className="bg-black/30 rounded-lg p-4 border border-gray-700/30">
                          <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {post.full_post}
                          </pre>
                        </div>
                        
                        {post.engagement_question && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-violet-400 mb-2">Engagement Question</h5>
                            <p className="text-gray-200 text-sm italic">"{post.engagement_question}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Content Ideas */}
          {response.follow_up_content && response.follow_up_content.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <TrendingUp size={20} className="text-emerald-400" />
                  <span>Follow-up Content Ideas</span>
                </h3>
                <button
                  onClick={() => copySection(
                    response.follow_up_content.map(item => 
                      `${item.concept} (${item.timing})\n${item.angle}`
                    ).join('\n\n'),
                    'followup'
                  )}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedSection === 'followup' ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {response.follow_up_content.map((item, index) => (
                  <div key={item.idea_id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <h4 className="font-medium text-white text-sm">{item.concept}</h4>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{item.angle}</p>
                    <p className="text-xs text-gray-500">Timing: {item.timing}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead Magnet Ideas */}
          {response.lead_magnet_ideas && response.lead_magnet_ideas.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Lightbulb size={20} className="text-yellow-400" />
                  <span>Lead Magnet Ideas</span>
                </h3>
                <button
                  onClick={() => copySection(
                    response.lead_magnet_ideas.map(item => 
                      `${item.type.toUpperCase()}: ${item.description}\nRelevance: ${item.relevance}`
                    ).join('\n\n'),
                    'leadmagnets'
                  )}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedSection === 'leadmagnets' ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>
              <div className="space-y-4">
                {response.lead_magnet_ideas.map((item, index) => (
                  <div key={item.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-white capitalize">{item.type}</h4>
                          <p className="text-xs text-gray-400">
                            Related to posts: {item.post_ids.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm mb-3 leading-relaxed">{item.description}</p>
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                      <h5 className="text-xs font-medium text-yellow-400 mb-1">Relevance</h5>
                      <p className="text-gray-200 text-xs">{item.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example Client Stories */}
          {response.example_client_stories && response.example_client_stories.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users size={20} className="text-rose-400" />
                  <span>Example Client Stories</span>
                </h3>
                <button
                  onClick={() => copySection(
                    response.example_client_stories.map(item => 
                      `Scenario: ${item.scenario}\nResult: ${item.result}\nContext: ${item.context}`
                    ).join('\n\n'),
                    'stories'
                  )}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedSection === 'stories' ? 'Copied!' : 'Copy All'}</span>
                </button>
              </div>
              <div className="space-y-4">
                {response.example_client_stories.map((story, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="w-8 h-8 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <p className="text-xs text-gray-400">
                        Related to posts: {story.post_ids.join(', ')}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-rose-400 mb-1">Scenario</h5>
                        <p className="text-gray-200 text-sm">{story.scenario}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-emerald-400 mb-1">Result</h5>
                        <p className="text-gray-200 text-sm">{story.result}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-cyan-400 mb-1">Context</h5>
                        <p className="text-gray-200 text-sm">{story.context}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="glass-card p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <FileText size={20} className="text-cyan-400" />
              <span>How to Use These Posts</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Copy and paste posts directly to LinkedIn</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Customize the content to match your voice</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Use follow-up ideas for content series</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Implement lead magnets to capture leads</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Adapt client stories to your experience</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Schedule posts for optimal engagement times</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}