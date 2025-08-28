import React, { useState } from 'react';
import { ArrowLeft, Lightbulb, Copy, RefreshCw, Wand2, TrendingUp, Users, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LinkedInPostIdeasProps {
  onBack: () => void;
}

interface PostIdea {
  id: string;
  title: string;
  content: string;
  hook: string;
  cta: string;
  hashtags: string[];
  postType: string;
  engagementTips: string[];
  estimatedReach: string;
}

interface GenerationRequest {
  niche: string;
  tone: string;
  postType: string;
  topics: string[];
}

export function LinkedInPostIdeas({ onBack }: LinkedInPostIdeasProps) {
  const { user } = useAuth();
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string>('');
  
  // Form state
  const [niche, setNiche] = useState('AI & Technology');
  const [tone, setTone] = useState('professional');
  const [postType, setPostType] = useState('thought-leadership');
  const [customTopics, setCustomTopics] = useState('');

  const niches = [
    'AI & Technology',
    'Digital Marketing',
    'Entrepreneurship',
    'Software Development',
    'Data Science',
    'Product Management',
    'Sales & Business Development',
    'Leadership & Management',
    'Startups & Innovation',
    'Consulting',
    'Finance & Investment',
    'HR & Recruiting'
  ];

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
    { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
    { value: 'educational', label: 'Educational', description: 'Informative and teaching' },
    { value: 'humorous', label: 'Humorous', description: 'Light-hearted with appropriate humor' },
    { value: 'controversial', label: 'Controversial', description: 'Thought-provoking and debate-starting' }
  ];

  const postTypes = [
    { value: 'thought-leadership', label: 'Thought Leadership', icon: '🧠' },
    { value: 'industry-insights', label: 'Industry Insights', icon: '📊' },
    { value: 'personal-story', label: 'Personal Story', icon: '📖' },
    { value: 'tips-advice', label: 'Tips & Advice', icon: '💡' },
    { value: 'question-engagement', label: 'Question for Engagement', icon: '❓' },
    { value: 'trend-analysis', label: 'Trend Analysis', icon: '📈' },
    { value: 'behind-scenes', label: 'Behind the Scenes', icon: '🎬' },
    { value: 'achievement-milestone', label: 'Achievement/Milestone', icon: '🏆' }
  ];

  // Generate post ideas
  const generatePostIdeas = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const topics = customTopics.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      const request: GenerationRequest = {
        niche,
        tone,
        postType,
        topics
      };

      // Send to webhook for AI generation
      const webhookResponse = await fetch('https://hook.us1.make.com/linkedin-post-ideas-webhook-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          userId: user.id,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Failed to generate post ideas: ${webhookResponse.status}`);
      }

      // For demo purposes, using mock data
      const mockPostIdeas: PostIdea[] = [
        {
          id: '1',
          title: 'The Future of AI in Business Decision Making',
          content: `🤖 AI isn't just changing how we work—it's revolutionizing how we think about business decisions.

I've been working with AI tools for the past 2 years, and here's what I've learned about their impact on strategic thinking:

✅ Data-driven insights happen in real-time, not quarterly reviews
✅ Pattern recognition reveals opportunities humans miss
✅ Predictive analytics helps us stay ahead of market shifts
✅ Automated analysis frees up time for creative problem-solving

But here's the catch: AI amplifies your existing decision-making framework. If your processes are flawed, AI will scale those flaws.

The companies winning with AI aren't just adopting the technology—they're redesigning their decision-making culture around it.

What's your experience with AI in business decisions? Are you seeing similar patterns?`,
          hook: '🤖 AI isn\'t just changing how we work—it\'s revolutionizing how we think about business decisions.',
          cta: 'What\'s your experience with AI in business decisions? Are you seeing similar patterns?',
          hashtags: ['#AI', '#BusinessStrategy', '#DecisionMaking', '#Innovation', '#Leadership', '#Technology'],
          postType: 'thought-leadership',
          engagementTips: [
            'Ask a specific question to encourage comments',
            'Share a personal experience to build credibility',
            'Use bullet points for easy scanning',
            'Include a contrarian viewpoint to spark discussion'
          ],
          estimatedReach: '2,500 - 5,000 impressions'
        },
        {
          id: '2',
          title: 'My Biggest AI Implementation Mistake (And How You Can Avoid It)',
          content: `💸 I wasted $50,000 on an AI project that never saw the light of day.

Here's what went wrong (and the lesson that saved my next project):

THE MISTAKE:
We jumped straight into building a complex AI solution without understanding our actual problem. We were so excited about the technology that we forgot to validate the business need.

THE RESULT:
• 6 months of development
• $50K in costs
• Zero business impact
• A very expensive lesson

THE LESSON:
Start with the problem, not the solution.

Now, before any AI project, I ask these 3 questions:
1. What specific business problem are we solving?
2. How are we solving it today (and what's wrong with that)?
3. Will AI actually make this 10x better, or just 10% better?

If I can't answer all three clearly, we don't move forward.

My next AI project? It solved a real problem, launched in 6 weeks, and paid for itself in 2 months.

What's the biggest mistake you've made with new technology? Let's learn from each other.`,
          hook: '💸 I wasted $50,000 on an AI project that never saw the light of day.',
          cta: 'What\'s the biggest mistake you\'ve made with new technology? Let\'s learn from each other.',
          hashtags: ['#AI', '#Entrepreneurship', '#Lessons', '#BusinessStrategy', '#Innovation', '#Failure'],
          postType: 'personal-story',
          engagementTips: [
            'Lead with a shocking statistic or loss',
            'Structure the story with clear sections',
            'Include specific numbers for credibility',
            'End with a relatable question'
          ],
          estimatedReach: '3,000 - 7,000 impressions'
        },
        {
          id: '3',
          title: '5 AI Tools Every Professional Should Know in 2024',
          content: `🚀 These 5 AI tools are game-changers for productivity in 2024:

1. **Claude 3.5 Sonnet** (Writing & Analysis)
   → Best for: Complex reasoning and long-form content
   → Why it matters: Outperforms GPT-4 on many tasks
   → Cost: $20/month

2. **Notion AI** (Knowledge Management)
   → Best for: Organizing and connecting information
   → Why it matters: Turns your notes into a smart database
   → Cost: $10/month add-on

3. **Midjourney v6** (Visual Content)
   → Best for: Professional-quality images and designs
   → Why it matters: Creates content that rivals human designers
   → Cost: $30/month

4. **Perplexity Pro** (Research)
   → Best for: Real-time information and citations
   → Why it matters: Combines search with AI reasoning
   → Cost: $20/month

5. **GitHub Copilot** (Code & Automation)
   → Best for: Writing code and automating tasks
   → Why it matters: Even non-programmers can build simple tools
   → Cost: $10/month

Total monthly cost: $90
Time saved per week: 10+ hours
ROI: Pays for itself in the first week

Which of these are you already using? Any hidden gems I missed?`,
          hook: '🚀 These 5 AI tools are game-changers for productivity in 2024:',
          cta: 'Which of these are you already using? Any hidden gems I missed?',
          hashtags: ['#AI', '#Productivity', '#Tools', '#Technology', '#Efficiency', '#2024'],
          postType: 'tips-advice',
          engagementTips: [
            'Use numbered lists for easy consumption',
            'Include specific pricing for transparency',
            'Add ROI calculations to show value',
            'Ask for recommendations to boost engagement'
          ],
          estimatedReach: '4,000 - 8,000 impressions'
        }
      ];

      setPostIdeas(mockPostIdeas);

    } catch (err) {
      console.error('Failed to generate post ideas:', err);
      setError('Failed to generate post ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy post content
  const copyPostContent = async (post: PostIdea) => {
    const fullPost = `${post.content}

${post.hashtags.join(' ')}`;

    try {
      await navigator.clipboard.writeText(fullPost);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Back to Tools</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">LinkedIn Post Ideas</h1>
          <p className="text-gray-400">Generate engaging LinkedIn posts tailored to your niche and audience</p>
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

      {/* Generation Form */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Wand2 size={20} className="text-cyan-400" />
          <span>Customize Your Post Ideas</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Niche Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Niche/Industry
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {niches.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tone of Voice
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {tones.map(t => (
                <option key={t.value} value={t.value}>{t.label} - {t.description}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Post Type Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Post Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {postTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setPostType(type.value)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  postType === type.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="text-lg mb-1">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Topics */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Specific Topics (Optional)
          </label>
          <input
            type="text"
            value={customTopics}
            onChange={(e) => setCustomTopics(e.target.value)}
            placeholder="e.g., ChatGPT, automation, productivity (comma-separated)"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank for general topics in your niche</p>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={generatePostIdeas}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Ideas...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Post Ideas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Post Ideas */}
      {postIdeas.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Generated Post Ideas</h3>
            <button
              onClick={generatePostIdeas}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Generate New Ideas</span>
            </button>
          </div>

          {postIdeas.map((post, index) => (
            <div key={post.id} className="glass-card p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{post.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-400 capitalize">{post.postType.replace('-', ' ')}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-400">{post.estimatedReach}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyPostContent(post)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Copy size={16} />
                  <span>{copiedId === post.id ? 'Copied!' : 'Copy Post'}</span>
                </button>
              </div>

              {/* Post Content */}
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700/30">
                <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {post.content}
                </pre>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.hashtags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Engagement Tips */}
              <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-xl p-4 border border-violet-500/20">
                <h5 className="text-sm font-bold text-violet-400 mb-2 flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span>Engagement Tips</span>
                </h5>
                <ul className="space-y-1">
                  {post.engagementTips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-sm text-gray-300 flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {postIdeas.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate Post Ideas?</h3>
          <p className="text-gray-400 mb-6">
            Customize your preferences above and click "Generate Post Ideas" to get started.
          </p>
        </div>
      )}

      {/* Tips Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Users size={20} className="text-cyan-400" />
          <span>LinkedIn Engagement Best Practices</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <MessageSquare size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white text-sm mb-1">Ask Questions</h4>
              <p className="text-gray-400 text-xs">End posts with engaging questions to boost comments</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <TrendingUp size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white text-sm mb-1">Share Stories</h4>
              <p className="text-gray-400 text-xs">Personal experiences get 3x more engagement</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Sparkles size={16} className="text-violet-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white text-sm mb-1">Use Visuals</h4>
              <p className="text-gray-400 text-xs">Posts with images get 2x more views</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}