import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVideoRevenue } from '../../hooks/useVideoRevenue';
import { CreateVideoRevenueGenerationData } from '../../types/videoRevenue';
import { VideoRevenueViewer } from './VideoRevenueViewer';
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Wand2, 
  Youtube, 
  Mail, 
  Users, 
  Linkedin,
  Crown,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface VideoRevenueFormProps {
  onBack: () => void;
}

// Tone options
const newsletterTones = [
  'professional',
  'educational', 
  'casual',
  'urgent',
  'conversational',
  'authoritative',
  'friendly',
  'inspiring'
];

const freeCommunityTones = [
  'engaging',
  'helpful',
  'motivational',
  'friendly',
  'welcoming',
  'encouraging',
  'supportive',
  'casual'
];

const paidCommunityTones = [
  'exclusive',
  'premium',
  'value-driven',
  'persuasive',
  'professional',
  'insider',
  'advanced',
  'results-focused'
];

const linkedinTones = [
  'professional',
  'thought-leadership',
  'authoritative',
  'conversational',
  'educational',
  'inspiring',
  'strategic',
  'industry-expert'
];

// CTA options
const newsletterCTAs = [
  "Subscribe to my weekly newsletter for more AI insights",
  "Join 1,000+ creators getting my exclusive AI updates",
  "Get my free Vertical AI Builder's Guide in your inbox",
  "Never miss my latest AI business strategies - subscribe now",
  "Download my AI implementation checklist (free for subscribers)",
  "Join my email list for early access to new resources",
  "Get weekly AI tools and tactics delivered to your inbox"
];

const freeCommunityCtAs = [
  "Join our free Vertical AI Builders community",
  "Connect with 1,000+ AI entrepreneurs in our free group",
  "Get instant access to our free AI builders community",
  "Join the conversation in our free Skool community",
  "Access free resources and connect with like-minded builders",
  "Become part of our growing AI community (100% free)",
  "Join thousands of AI builders sharing strategies daily"
];

const paidCommunityCTAs = [
  "Upgrade to our premium AI Builders Accelerator",
  "Join our exclusive paid community for advanced strategies", 
  "Get VIP access to our premium AI implementation group",
  "Unlock advanced AI business blueprints with premium access",
  "Join our inner circle of successful AI entrepreneurs",
  "Upgrade for exclusive case studies and 1-on-1 support",
  "Access premium templates and weekly expert calls"
];

export function VideoRevenueForm({ onBack }: VideoRevenueFormProps) {
  const { user } = useAuth();
  const { 
    createGeneration, 
    createNewsletterEmail, 
    createSkoolPost, 
    createLinkedInPost,
    updateGeneration 
  } = useVideoRevenue();
  
  const [formData, setFormData] = useState<CreateVideoRevenueGenerationData>({
    video_url: '',
    video_title: '',
    video_description: '',
    template_resource: '',
    key_insights: [],
    main_teaching: '',
    featured_template: '',
    newsletter_cta: newsletterCTAs[0],
    newsletter_tone: newsletterTones[0],
    free_community_cta: freeCommunityCtAs[0],
    free_community_tone: freeCommunityTones[0],
    paid_community_cta: paidCommunityCTAs[0],
    paid_community_tone: paidCommunityTones[0],
    linkedin_keyword: 'TEMPLATE',
    status: 'draft'
  });

  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string>('');

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Get video metadata from YouTube oEmbed API
  const getVideoMetadata = async (videoId: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title,
          thumbnail: data.thumbnail_url,
          author: data.author_name
        };
      }
    } catch (err) {
      console.error('Failed to fetch video metadata:', err);
    }
    return null;
  };

  // Handle URL input change and auto-embed
  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, video_url: url }));
    setError('');
    
    if (url.trim()) {
      const videoId = extractVideoId(url);
      if (videoId) {
        setCurrentVideoId(videoId);
        
        // Auto-fetch video title
        const metadata = await getVideoMetadata(videoId);
        if (metadata) {
          setFormData(prev => ({
            ...prev,
            video_title: metadata.title
          }));
        }
      } else {
        setCurrentVideoId('');
      }
    } else {
      setCurrentVideoId('');
    }
  };

  const handleChange = (field: keyof CreateVideoRevenueGenerationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.video_url.trim()) {
      return 'YouTube Video URL is required';
    }
    
    if (!extractVideoId(formData.video_url)) {
      return 'Please enter a valid YouTube video URL';
    }
    
    if (!formData.video_title.trim()) {
      return 'Video Title/Topic is required';
    }
    
    if (!formData.template_resource.trim()) {
      return 'Featured Template/Resource is required';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // First, create the generation in the database
      const generation = await createGeneration(formData);
      setGenerationId(generation.id);

      // Prepare webhook payload
      const webhookPayload = {
        generationId: generation.id,
        userId: user.id,
        videoUrl: formData.video_url,
        videoTitle: formData.video_title,
        videoDescription: formData.video_description || '',
        templateResource: formData.template_resource,
        newsletterCta: formData.newsletter_cta,
        newsletterTone: formData.newsletter_tone,
        freeCommunityTone: formData.free_community_tone,
        freeCommunityTone: formData.free_community_tone,
        paidCommunityCta: formData.paid_community_cta,
        paidCommunityTone: formData.paid_community_tone,
        linkedinKeyword: formData.linkedin_keyword,
        timestamp: new Date().toISOString(),
      };

      // Send to webhook
      const webhookResponse = await fetch('https://hook.us1.make.com/hip1yqo1a2xl351bp7972du56tc1at9g', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status}`);
      }

      // Parse the JSON response from the webhook
      const responseData = await webhookResponse.json();
      console.log('Webhook response:', responseData);

      // Update the generation with the analysis data
      await updateGeneration(generation.id, {
        key_insights: responseData.video_analysis?.key_insights || [],
        main_teaching: responseData.video_analysis?.main_teaching || '',
        featured_template: responseData.video_analysis?.featured_template || '',
        status: 'ready'
      });

      // Save newsletter emails
      if (responseData.newsletter_emails) {
        for (const email of responseData.newsletter_emails) {
          await createNewsletterEmail({
            generation_id: generation.id,
            email_number: email.email_number,
            configured_tone: email.configured_tone,
            configured_cta: email.configured_cta,
            subject_line: email.subject_line,
            content: email.content,
            cta_integration: email.cta_integration,
          });
        }
      }

      // Save Skool posts
      if (responseData.skool_posts) {
        for (const post of responseData.skool_posts) {
          await createSkoolPost({
            generation_id: generation.id,
            community: post.community,
            post_number: post.post_number,
            configured_tone: post.configured_tone,
            configured_cta: post.configured_cta,
            content: post.content,
            cta_integration: post.cta_integration,
          });
        }
      }

      // Save LinkedIn posts
      if (responseData.linkedin_posts) {
        for (const post of responseData.linkedin_posts) {
          await createLinkedInPost({
            generation_id: generation.id,
            variation: post.variation.toString(),
            configured_tone: post.configured_tone,
            configured_keyword: post.configured_keyword,
            hook: post.hook,
            content: post.content,
            cta_line: post.cta_line,
          });
        }
      }

      // Set the generated data to show the viewer
      setGeneratedData(responseData);
      
    } catch (err) {
      console.error('Failed to create pipeline:', err);
      setError('Failed to create pipeline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show the viewer if we have generated data
  if (generatedData) {
    return (
      <VideoRevenueViewer 
        data={generatedData}
        generationId={generationId}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Back to Pipelines</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">Video-to-Revenue Pipeline</h1>
          <p className="text-gray-400">Transform your YouTube videos into revenue-generating content across all platforms</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Video Input */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <Youtube size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Video Input</h3>
            </div>

            <div className="space-y-4">
              {/* YouTube Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Video Title/Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Title/Topic *
                </label>
                <input
                  type="text"
                  value={formData.video_title}
                  onChange={(e) => handleChange('video_title', e.target.value)}
                  placeholder="e.g., How to Build an AI Agency from $0 to $100K"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Video Description/Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Description/Summary
                </label>
                <textarea
                  value={formData.video_description}
                  onChange={(e) => handleChange('video_description', e.target.value)}
                  placeholder="Optional: Brief description or summary of the video content..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Optional field to provide additional context about your video content</p>
              </div>

              {/* Featured Template/Resource */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Featured Template/Resource *
                </label>
                <input
                  type="text"
                  value={formData.template_resource}
                  onChange={(e) => handleChange('template_resource', e.target.value)}
                  placeholder="e.g., AI Agency Client Acquisition Template"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">What template or resource is featured in this video?</p>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Video Preview</h3>
            {currentVideoId ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-800">
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <Play size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Enter a YouTube URL to preview the video</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Output Configuration */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg">
                <Wand2 size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Output Configuration</h3>
            </div>

            <div className="space-y-6">
              {/* Newsletter Email */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail size={18} className="text-blue-400" />
                  <h4 className="font-semibold text-white">Newsletter Email</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CTA</label>
                    <select
                      value={formData.newsletter_cta}
                      onChange={(e) => handleChange('newsletter_cta', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {newsletterCTAs.map((cta, index) => (
                        <option key={index} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                    <select
                      value={formData.newsletter_tone}
                      onChange={(e) => handleChange('newsletter_tone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {newsletterTones.map((tone) => (
                        <option key={tone} value={tone} className="capitalize">{tone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Free Community Content */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Users size={18} className="text-emerald-400" />
                  <h4 className="font-semibold text-white">Free Community Content</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CTA</label>
                    <select
                      value={formData.free_community_cta}
                      onChange={(e) => handleChange('free_community_cta', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {freeCommunityCtAs.map((cta, index) => (
                        <option key={index} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                    <select
                      value={formData.free_community_tone}
                      onChange={(e) => handleChange('free_community_tone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {freeCommunityTones.map((tone) => (
                        <option key={tone} value={tone} className="capitalize">{tone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Paid Community Content */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Crown size={18} className="text-yellow-400" />
                  <h4 className="font-semibold text-white">Paid Community Content</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CTA</label>
                    <select
                      value={formData.paid_community_cta}
                      onChange={(e) => handleChange('paid_community_cta', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {paidCommunityCTAs.map((cta, index) => (
                        <option key={index} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                    <select
                      value={formData.paid_community_tone}
                      onChange={(e) => handleChange('paid_community_tone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {paidCommunityTones.map((tone) => (
                        <option key={tone} value={tone} className="capitalize">{tone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* LinkedIn Post */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Linkedin size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-white">LinkedIn Post</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comment Keyword</label>
                  <input
                    type="text"
                    value={formData.linkedin_keyword}
                    onChange={(e) => handleChange('linkedin_keyword', e.target.value)}
                    placeholder="TEMPLATE"
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Always ends with: "Comment {formData.linkedin_keyword} and connect with me to receive this free template"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="glass-card p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Creating Pipeline...</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Create Revenue Pipeline</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will generate comprehensive revenue content across all platforms using AI.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}