import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface YouTubeAnalysis {
  id: string;
  user_id: string;
  video_url: string;
  video_id: string;
  video_title: string;
  video_thumbnail?: string;
  analysis_html: string;
  status: 'pending' | 'completed' | 'failed';
  webhook_response: any;
  created_at: string;
  updated_at: string;
}

export function useYouTubeAnalysis() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<YouTubeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all analyses for the current user
  const fetchAnalyses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('youtube_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAnalyses(data || []);
    } catch (err) {
      console.error('Error fetching YouTube analyses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analyses');
    } finally {
      setLoading(false);
    }
  };

  // Create new analysis entry
  const createAnalysis = async (analysisData: {
    video_url: string;
    video_id: string;
    video_title?: string;
    video_thumbnail?: string;
  }): Promise<YouTubeAnalysis> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newAnalysis = {
        ...analysisData,
        user_id: user.id,
        video_title: analysisData.video_title || 'YouTube Video',
        status: 'pending' as const,
        analysis_html: '',
        webhook_response: {},
      };

      const { data, error: createError } = await supabase
        .from('youtube_analysis')
        .insert([newAnalysis])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setAnalyses(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating analysis:', err);
      throw err;
    }
  };

  // Update existing analysis
  const updateAnalysis = async (id: string, updates: Partial<YouTubeAnalysis>): Promise<YouTubeAnalysis> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: updateError } = await supabase
        .from('youtube_analysis')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      setAnalyses(prev => 
        prev.map(analysis => analysis.id === id ? { ...analysis, ...data } : analysis)
      );
      return data;
    } catch (err) {
      console.error('Error updating analysis:', err);
      throw err;
    }
  };

  // Delete analysis
  const deleteAnalysis = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('youtube_analysis')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      throw err;
    }
  };

  // Get analysis by video ID (to check for duplicates)
  const getAnalysisByVideoId = (videoId: string): YouTubeAnalysis | undefined => {
    return analyses.find(analysis => analysis.video_id === videoId);
  };

  // Mark analysis as completed with HTML content
  const completeAnalysis = async (id: string, analysisHtml: string, webhookResponse?: any): Promise<YouTubeAnalysis> => {
    return updateAnalysis(id, {
      status: 'completed',
      analysis_html: analysisHtml,
      webhook_response: webhookResponse || {},
    });
  };

  // Mark analysis as failed
  const failAnalysis = async (id: string, error?: string): Promise<YouTubeAnalysis> => {
    return updateAnalysis(id, {
      status: 'failed',
      webhook_response: { error: error || 'Analysis failed' },
    });
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchAnalyses();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('youtube_analysis_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_analysis',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time YouTube analysis update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setAnalyses(prev => [payload.new as YouTubeAnalysis, ...prev]);
              break;
            case 'UPDATE':
              setAnalyses(prev => 
                prev.map(analysis => 
                  analysis.id === payload.new.id ? payload.new as YouTubeAnalysis : analysis
                )
              );
              break;
            case 'DELETE':
              setAnalyses(prev => prev.filter(analysis => analysis.id !== payload.old.id));
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
    analyses,
    loading,
    error,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    getAnalysisByVideoId,
    completeAnalysis,
    failAnalysis,
    refetch: fetchAnalyses,
  };
}