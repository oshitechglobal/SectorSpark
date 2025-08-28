import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Mail, 
  Users, 
  Linkedin, 
  Crown, 
  Eye, 
  CheckCircle,
  Lightbulb,
  Target,
  TrendingUp,
  MessageSquare,
  Star,
  Calendar,
  ExternalLink,
  FileText,
  Share2
} from 'lucide-react';
import { VideoRevenuePipelineData } from '../../types/videoRevenue';

interface VideoRevenueViewerProps {
  pipelineData: VideoRevenuePipelineData;
  onBack: () => void;
}

export function VideoRevenueViewer({ pipelineData, onBack }: VideoRevenueViewerProps) {
  const [copiedItem, setCopiedItem] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'emails' | 'skool' | 'linkedin'>('overview');

  const { generation, newsletterEmails, skoolPosts, linkedinPosts } = pipelineData;

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(''), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadAllContent = () => {
    let allContent = `VIDEO-TO-REVENUE PIPELINE CONTENT\n`;
    allContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    allContent += `Generation ID: ${generation.id}\n\n`;
    
    // Video Analysis
    allContent += `=== VIDEO ANALYSIS ===\n`;
    allContent += `Title: ${generation.video_title}\n\n`;
    allContent += `Main Teaching: ${generation.main_teaching || 'N/A'}\n\n`;
    allContent += `Featured Template: ${generation.featured_template || 'N/A'}\n\n`;
    allContent += `Key Insights:\n`;
    generation.key_insights.forEach((insight: string, index: number) => {
      allContent += `${index + 1}. ${insight}\n`;
    });
    allContent += `\n`;

    // Newsletter Emails
    if (newsletterEmails.length > 0) {
      allContent += `=== NEWSLETTER EMAILS ===\n\n`;
      newsletterEmails.forEach((email, index) => {
        allContent += `EMAIL ${email.email_number}\n`;
        allContent += `Subject: ${email.subject_line || 'N/A'}\n`;
        allContent += `Tone: ${email.configured_tone || 'N/A'}\n`;
        allContent += `CTA: ${email.configured_cta || 'N/A'}\n\n`;
        allContent += `Content:\n${email.content || 'N/A'}\n\n`;
        allContent += `CTA Integration: ${email.cta_integration || 'N/A'}\n\n`;
        allContent += `---\n\n`;
      });
    }

    // Skool Posts
    if (skoolPosts.length > 0) {
      allContent += `=== SKOOL POSTS ===\n\n`;
      skoolPosts.forEach((post, index) => {
        allContent += `${post.community.toUpperCase()} COMMUNITY POST ${post.post_number}\n`;
        allContent += `Tone: ${post.configured_tone || 'N/A'}\n`;
        allContent += `CTA: ${post.configured_cta || 'N/A'}\n\n`;
        allContent += `Content:\n${post.content || 'N/A'}\n\n`;
        allContent += `CTA Integration: ${post.cta_integration || 'N/A'}\n\n`;
        allContent += `---\n\n`;
      });
    }

    // LinkedIn Posts
    if (linkedinPosts.length > 0) {
      allContent += `=== LINKEDIN POSTS ===\n\n`;
      linkedinPosts.forEach((post, index) => {
        allContent += `LINKEDIN POST ${post.variation}\n`;
        allContent += `Tone: ${post.configured_tone || 'N/A'}\n`;
        allContent += `Keyword: ${post.configured_keyword || 'N/A'}\n\n`;
        allContent += `Hook: ${post.hook || 'N/A'}\n\n`;
        allContent += `Content:\n${post.content || 'N/A'}\n\n`;
        allContent += `CTA: ${post.cta_line || 'N/A'}\n\n`;
        allContent += `---\n\n`;
      });
    }

    downloadContent(allContent, `video-revenue-pipeline-${generation.id}.txt`);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Eye, count: 1 },
    { id: 'emails' as const, label: 'Newsletter Emails', icon: Mail, count: newsletterEmails.length },
    { id: 'skool' as const, label: 'Skool Posts', icon: Users, count: skoolPosts.length },
    { id: 'linkedin' as const, label: 'LinkedIn Posts', icon: Linkedin, count: linkedinPosts.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Pipelines</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Revenue Pipeline</h1>
            <p className="text-gray-400">
              {generation.video_title}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadAllContent}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Download All</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Share2 size={18} />
            <span>Share Pipeline</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle size={24} className="text-emerald-400" />
          <div>
            <h3 className="text-lg font-semibold text-emerald-400">Pipeline Ready!</h3>
            <p className="text-gray-300 mt-1">
              Your video has been transformed into {newsletterEmails.length + skoolPosts.length + linkedinPosts.length} pieces of revenue-generating content.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 glass-card p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Video Analysis */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Target size={20} className="text-cyan-400" />
                  <span>Video Analysis</span>
                </h3>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(generation, null, 2), 'analysis')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedItem === 'analysis' ? 'Copied!' : 'Copy Analysis'}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Main Teaching</h4>
                  <p className="text-gray-200 leading-relaxed">{generation.main_teaching || 'No main teaching provided'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Featured Template</h4>
                  <p className="text-gray-200">{generation.featured_template || generation.template_resource}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-400 mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {generation.key_insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 bg-gray-800/30 rounded-lg p-4">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-200 leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Mail size={24} className="text-blue-400 mr-2" />
                  <h4 className="font-semibold text-white">Newsletter Emails</h4>
                </div>
                <p className="text-3xl font-bold text-gradient mb-2">{newsletterEmails.length}</p>
                <p className="text-gray-400 text-sm">Ready-to-send email content</p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Users size={24} className="text-emerald-400 mr-2" />
                  <h4 className="font-semibold text-white">Skool Posts</h4>
                </div>
                <p className="text-3xl font-bold text-gradient mb-2">{skoolPosts.length}</p>
                <p className="text-gray-400 text-sm">Community engagement content</p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Linkedin size={24} className="text-blue-600 mr-2" />
                  <h4 className="font-semibold text-white">LinkedIn Posts</h4>
                </div>
                <p className="text-3xl font-bold text-gradient mb-2">{linkedinPosts.length}</p>
                <p className="text-gray-400 text-sm">Professional network content</p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'emails' && (
          <div className="space-y-6">
            {newsletterEmails.length === 0 ? (
              <div className="text-center py-12">
                <Mail size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">No Newsletter Emails</h4>
                <p className="text-gray-400">No newsletter emails were generated for this pipeline.</p>
              </div>
            ) : (
              newsletterEmails.map((email, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {email.email_number}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Newsletter Email {email.email_number}</h4>
                        <p className="text-sm text-gray-400">Tone: {email.configured_tone || 'N/A'} • CTA: {email.configured_cta || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(email.content || '', `email-${index}`)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Copy size={14} />
                        <span>{copiedItem === `email-${index}` ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => downloadContent(email.content || '', `newsletter-email-${email.email_number}.txt`)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-blue-400 mb-2">Subject Line</h5>
                      <p className="text-gray-200 bg-gray-800/30 rounded-lg p-3">{email.subject_line || 'No subject line'}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-blue-400 mb-2">Email Content</h5>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                        <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {email.content || 'No content available'}
                        </pre>
                      </div>
                    </div>

                    {email.cta_integration && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-400 mb-2">CTA Integration</h5>
                        <p className="text-gray-300 text-sm bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          {email.cta_integration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'skool' && (
          <div className="space-y-6">
            {skoolPosts.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">No Skool Posts</h4>
                <p className="text-gray-400">No Skool posts were generated for this pipeline.</p>
              </div>
            ) : (
              skoolPosts.map((post, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        post.community === 'Free' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      }`}>
                        {post.post_number}
                      </div>
                      <div>
                        <h4 className="font-bold text-white flex items-center space-x-2">
                          <span>{post.community} Community Post {post.post_number}</span>
                          {post.community === 'Paid' && <Crown size={16} className="text-yellow-400" />}
                        </h4>
                        <p className="text-sm text-gray-400">Tone: {post.configured_tone || 'N/A'} • CTA: {post.configured_cta || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(post.content || '', `skool-${index}`)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Copy size={14} />
                        <span>{copiedItem === `skool-${index}` ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => downloadContent(post.content || '', `skool-${post.community.toLowerCase()}-post-${post.post_number}.txt`)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-emerald-400 mb-2">Post Content</h5>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                        <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {post.content || 'No content available'}
                        </pre>
                      </div>
                    </div>

                    {post.cta_integration && (
                      <div>
                        <h5 className="text-sm font-medium text-emerald-400 mb-2">CTA Integration</h5>
                        <p className="text-gray-300 text-sm bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                          {post.cta_integration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'linkedin' && (
          <div className="space-y-6">
            {linkedinPosts.length === 0 ? (
              <div className="text-center py-12">
                <Linkedin size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">No LinkedIn Posts</h4>
                <p className="text-gray-400">No LinkedIn posts were generated for this pipeline.</p>
              </div>
            ) : (
              linkedinPosts.map((post, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.variation}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">LinkedIn Post Variation {post.variation}</h4>
                        <p className="text-sm text-gray-400">Tone: {post.configured_tone || 'N/A'} • Keyword: {post.configured_keyword || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(post.content || '', `linkedin-${index}`)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Copy size={14} />
                        <span>{copiedItem === `linkedin-${index}` ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => downloadContent(post.content || '', `linkedin-post-${post.variation}.txt`)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {post.hook && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-400 mb-2">Hook</h5>
                        <p className="text-gray-200 bg-gray-800/30 rounded-lg p-3 italic">"{post.hook}"</p>
                      </div>
                    )}

                    <div>
                      <h5 className="text-sm font-medium text-blue-400 mb-2">Full Post Content</h5>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                        <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {post.content || 'No content available'}
                        </pre>
                      </div>
                    </div>

                    {post.cta_line && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-400 mb-2">Call-to-Action</h5>
                        <p className="text-gray-300 text-sm bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          {post.cta_line}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Usage Tips */}
      <div className="glass-card p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Lightbulb size={20} className="text-cyan-400" />
          <span>How to Use Your Generated Content</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Mail size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white text-sm mb-1">Newsletter Emails</h4>
                <p className="text-gray-400 text-xs">Copy and paste into your email marketing platform. Customize subject lines and CTAs as needed.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Users size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white text-sm mb-1">Skool Posts</h4>
                <p className="text-gray-400 text-xs">Post directly to your free and paid communities. Adjust tone based on your community culture.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Linkedin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white text-sm mb-1">LinkedIn Posts</h4>
                <p className="text-gray-400 text-xs">Schedule for optimal posting times. Use different variations to test engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}