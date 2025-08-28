import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface CommentScraping {
  id: string;
  user_id: string;
  video_url: string;
  video_id: string;
  video_title: string;
  video_thumbnail?: string;
  comment_count: number;
  scraped_data: any;
  status: 'pending' | 'completed' | 'failed';
  webhook_response: any;
  // Category columns (now text fields)
  most_requested_ai_tools: string;
  ai_tool_comparisons: string;
  use_cases_applications: string;
  problems_complaints: string;
  ai_business_monetization: string;
  content_requests_suggestions: string;
  created_at: string;
  updated_at: string;
}

export interface CommentCategories {
  mostRequestedAiTools: string;
  aiToolComparisons: string;
  useCasesApplications: string;
  problemsComplaints: string;
  aiBusinessMonetization: string;
  contentRequestsSuggestions: string;
}

export function useCommentScraping() {
  const { user } = useAuth();
  const [scrapings, setScrapings] = useState<CommentScraping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all scrapings for the current user
  const fetchScrapings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('comment_scraping')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setScrapings(data || []);
    } catch (err) {
      console.error('Error fetching comment scrapings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scrapings');
    } finally {
      setLoading(false);
    }
  };

  // Create new scraping entry
  const createScraping = async (scrapingData: {
    video_url: string;
    video_id: string;
    video_title?: string;
    video_thumbnail?: string;
    comment_count: number;
  }): Promise<CommentScraping> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newScraping = {
        ...scrapingData,
        user_id: user.id,
        video_title: scrapingData.video_title || 'YouTube Video',
        status: 'pending' as const,
        scraped_data: {},
        webhook_response: {},
        most_requested_ai_tools: '',
        ai_tool_comparisons: '',
        use_cases_applications: '',
        problems_complaints: '',
        ai_business_monetization: '',
        content_requests_suggestions: '',
      };

      const { data, error: createError } = await supabase
        .from('comment_scraping')
        .insert([newScraping])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setScrapings(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating scraping:', err);
      throw err;
    }
  };

  // Update existing scraping
  const updateScraping = async (id: string, updates: Partial<CommentScraping>): Promise<CommentScraping> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: updateError } = await supabase
        .from('comment_scraping')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      setScrapings(prev => 
        prev.map(scraping => scraping.id === id ? { ...scraping, ...data } : scraping)
      );
      return data;
    } catch (err) {
      console.error('Error updating scraping:', err);
      throw err;
    }
  };

  // Delete scraping
  const deleteScraping = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('comment_scraping')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setScrapings(prev => prev.filter(scraping => scraping.id !== id));
    } catch (err) {
      console.error('Error deleting scraping:', err);
      throw err;
    }
  };

  // Get scraping by video ID (to check for duplicates)
  const getScrapingByVideoId = (videoId: string): CommentScraping | undefined => {
    return scrapings.find(scraping => scraping.video_id === videoId);
  };

  // Mark scraping as completed with categorized data
  const completeScraping = async (
    id: string, 
    categories: CommentCategories, 
    webhookResponse?: any
  ): Promise<CommentScraping> => {
    return updateScraping(id, {
      status: 'completed',
      most_requested_ai_tools: categories.mostRequestedAiTools,
      ai_tool_comparisons: categories.aiToolComparisons,
      use_cases_applications: categories.useCasesApplications,
      problems_complaints: categories.problemsComplaints,
      ai_business_monetization: categories.aiBusinessMonetization,
      content_requests_suggestions: categories.contentRequestsSuggestions,
      webhook_response: webhookResponse || {},
    });
  };

  // Mark scraping as failed
  const failScraping = async (id: string, error?: string): Promise<CommentScraping> => {
    return updateScraping(id, {
      status: 'failed',
      webhook_response: { error: error || 'Scraping failed' },
    });
  };

  // Helper function to split text into array for display
  const getCommentsArray = (text: string): string[] => {
    if (!text || text.trim() === '') return [];
    return text.split('\n\n').filter(comment => comment.trim() !== '');
  };

  // Helper function to get total comment count
  const getTotalComments = (scraping: CommentScraping): number => {
    return (
      getCommentsArray(scraping.most_requested_ai_tools).length +
      getCommentsArray(scraping.ai_tool_comparisons).length +
      getCommentsArray(scraping.use_cases_applications).length +
      getCommentsArray(scraping.problems_complaints).length +
      getCommentsArray(scraping.ai_business_monetization).length +
      getCommentsArray(scraping.content_requests_suggestions).length
    );
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchScrapings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('comment_scraping_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_scraping',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time comment scraping update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setScrapings(prev => [payload.new as CommentScraping, ...prev]);
              break;
            case 'UPDATE':
              setScrapings(prev => 
                prev.map(scraping => 
                  scraping.id === payload.new.id ? payload.new as CommentScraping : scraping
                )
              );
              break;
            case 'DELETE':
              setScrapings(prev => prev.filter(scraping => scraping.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    scrapings,
    loading,
    error,
    createScraping,
    updateScraping,
    deleteScraping,
    getScrapingByVideoId,
    completeScraping,
    failScraping,
    getCommentsArray,
    getTotalComments,
    refetch: fetchScrapings,
  };
}