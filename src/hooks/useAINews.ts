import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface AINews {
  id: string;
  user_id: string;
  name: string;
  title: string;
  url: string;
  html_content: string;
  summary: string;
  category: string;
  published_at: string;
  relevance_score: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface LinkedInPostOutput {
  id: string;
  user_id: string;
  news_id: string;
  webhook_response: any;
  created_at: string;
  updated_at: string;
}

export interface LinkedInPost {
  post_id: number;
  format_type: string;
  strategic_angle: string;
  hook: string;
  full_post: string;
  engagement_question: string;
  cta_strategy: string;
  hashtags: string[];
  target_metrics: string[];
}

export interface ContentStrategy {
  news_source: string;
  strategic_overview: string;
}

export interface FollowUpContent {
  idea_id: number;
  concept: string;
  angle: string;
  timing: string;
}

export interface LeadMagnetIdea {
  id: string;
  type: string;
  description: string;
  relevance: string;
  post_ids: number[];
}

export interface ClientStory {
  scenario: string;
  result: string;
  context: string;
  post_ids: number[];
}

export interface LinkedInPostsResponse {
  content_strategy: ContentStrategy;
  linkedin_posts: LinkedInPost[];
  follow_up_content: FollowUpContent[];
  lead_magnet_ideas: LeadMagnetIdea[];
  example_client_stories: ClientStory[];
}

export function useAINews() {
  const { user } = useAuth();
  const [news, setNews] = useState<AINews[]>([]);
  const [postOutputs, setPostOutputs] = useState<LinkedInPostOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all news for the current user
  const fetchNews = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_news')
        .select('*')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setNews(data || []);
    } catch (err) {
      console.error('Error fetching AI news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all post outputs for the current user
  const fetchPostOutputs = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('linkedin_post_outputs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPostOutputs(data || []);
    } catch (err) {
      console.error('Error fetching post outputs:', err);
    }
  };

  // Create new news entry
  const createNews = async (newsData: {
    name: string;
    title: string;
    url: string;
    html_content?: string;
    summary?: string;
    category?: string;
    published_at?: string;
    relevance_score?: number;
    tags?: string[];
  }): Promise<AINews> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newNews = {
        ...newsData,
        user_id: user.id,
        html_content: newsData.html_content || '',
        summary: newsData.summary || '',
        category: newsData.category || 'general',
        published_at: newsData.published_at || new Date().toISOString(),
        relevance_score: newsData.relevance_score || 50,
        tags: newsData.tags || [],
      };

      const { data, error: createError } = await supabase
        .from('ai_news')
        .insert([newNews])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setNews(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating news:', err);
      throw err;
    }
  };

  // Create LinkedIn post output
  const createLinkedInPostOutput = async (
    newsId: string,
    webhookResponse: any
  ): Promise<LinkedInPostOutput> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newPostOutput = {
        user_id: user.id,
        news_id: newsId,
        webhook_response: webhookResponse,
      };

      const { data, error: createError } = await supabase
        .from('linkedin_post_outputs')
        .insert([newPostOutput])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setPostOutputs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating LinkedIn post output:', err);
      throw err;
    }
  };

  // Get LinkedIn post output by news ID
  const getLinkedInPostOutputByNewsId = (newsId: string): LinkedInPostOutput | undefined => {
    return postOutputs.find(output => output.news_id === newsId);
  };

  // Generate LinkedIn post and handle webhook response
  const generatePost = async (newsItem: AINews): Promise<LinkedInPostOutput | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if post already exists for this news item
      const existingOutput = getLinkedInPostOutputByNewsId(newsItem.id);
      if (existingOutput) {
        return existingOutput;
      }

      // Send all news info to the webhook
      const webhookResponse = await fetch('https://hook.us1.make.com/bktic3rwxgr7w7m8p65xr77rrfb659q2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId: newsItem.id,
          userId: user.id,
          name: newsItem.name,
          title: newsItem.title,
          url: newsItem.url,
          htmlContent: newsItem.html_content,
          summary: newsItem.summary,
          category: newsItem.category,
          publishedAt: newsItem.published_at,
          relevanceScore: newsItem.relevance_score,
          tags: newsItem.tags,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status}`);
      }

      // Parse the JSON response from the webhook
      const responseData = await webhookResponse.json();

      // Save the webhook response to the database
      const postOutput = await createLinkedInPostOutput(newsItem.id, responseData);

      console.log('LinkedIn post generation successful:', postOutput);
      return postOutput;

    } catch (err) {
      console.error('Failed to generate LinkedIn post:', err);
      throw err;
    }
  };

  // Update existing news
  const updateNews = async (id: string, updates: Partial<AINews>): Promise<AINews> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: updateError } = await supabase
        .from('ai_news')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      setNews(prev => 
        prev.map(newsItem => newsItem.id === id ? { ...newsItem, ...data } : newsItem)
      );
      return data;
    } catch (err) {
      console.error('Error updating news:', err);
      throw err;
    }
  };

  // Delete news
  const deleteNews = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('ai_news')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setNews(prev => prev.filter(newsItem => newsItem.id !== id));
    } catch (err) {
      console.error('Error deleting news:', err);
      throw err;
    }
  };

  // Delete LinkedIn post output
  const deleteLinkedInPostOutput = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('linkedin_post_outputs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setPostOutputs(prev => prev.filter(output => output.id !== id));
    } catch (err) {
      console.error('Error deleting LinkedIn post output:', err);
      throw err;
    }
  };

  // Search news
  const searchNews = async (query: string): Promise<AINews[]> => {
    if (!user) return [];

    try {
      const { data, error: searchError } = await supabase
        .from('ai_news')
        .select('*')
        .eq('user_id', user.id)
        .textSearch('title', query)
        .order('relevance_score', { ascending: false });

      if (searchError) {
        throw searchError;
      }

      return data || [];
    } catch (err) {
      console.error('Error searching news:', err);
      return [];
    }
  };

  // Filter news by category
  const getNewsByCategory = (category: string): AINews[] => {
    if (category === 'all') return news;
    return news.filter(item => item.category === category);
  };

  // Get news statistics
  const getNewsStats = () => {
    const totalNews = news.length;
    const categories = news.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgRelevanceScore = totalNews > 0 
      ? Math.round(news.reduce((acc, item) => acc + item.relevance_score, 0) / totalNews)
      : 0;

    const todayNews = news.filter(item => {
      const today = new Date().toDateString();
      const newsDate = new Date(item.published_at).toDateString();
      return today === newsDate;
    }).length;

    const totalGeneratedPosts = postOutputs.length;

    return {
      totalNews,
      categories,
      avgRelevanceScore,
      todayNews,
      totalGeneratedPosts,
    };
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchNews();
    fetchPostOutputs();

    // Subscribe to real-time changes for ai_news
    const newsSubscription = supabase
      .channel('ai_news_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_news',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time AI news update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setNews(prev => [payload.new as AINews, ...prev]);
              break;
            case 'UPDATE':
              setNews(prev => 
                prev.map(newsItem => 
                  newsItem.id === payload.new.id ? payload.new as AINews : newsItem
                )
              );
              break;
            case 'DELETE':
              setNews(prev => prev.filter(newsItem => newsItem.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    // Subscribe to real-time changes for linkedin_post_outputs
    const postOutputsSubscription = supabase
      .channel('linkedin_post_outputs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'linkedin_post_outputs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time LinkedIn post outputs update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setPostOutputs(prev => [payload.new as LinkedInPostOutput, ...prev]);
              break;
            case 'UPDATE':
              setPostOutputs(prev => 
                prev.map(output => 
                  output.id === payload.new.id ? payload.new as LinkedInPostOutput : output
                )
              );
              break;
            case 'DELETE':
              setPostOutputs(prev => prev.filter(output => output.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      newsSubscription.unsubscribe();
      postOutputsSubscription.unsubscribe();
    };
  }, [user]);

  return {
    news,
    postOutputs,
    loading,
    error,
    createNews,
    updateNews,
    deleteNews,
    createLinkedInPostOutput,
    deleteLinkedInPostOutput,
    getLinkedInPostOutputByNewsId,
    generatePost,
    searchNews,
    getNewsByCategory,
    getNewsStats,
    refetch: fetchNews,
  };
}