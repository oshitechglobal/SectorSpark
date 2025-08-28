import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface YouTubeChapters {
  id: string;
  user_id: string;
  video_url: string;
  video_id: string;
  video_title: string;
  video_thumbnail?: string;
  chapters_text: string;
  status: 'pending' | 'completed' | 'failed';
  webhook_response: any;
  created_at: string;
  updated_at: string;
}

export function useYouTubeChapters() {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<YouTubeChapters[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all chapters for the current user
  const fetchChapters = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('youtube_chapters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setChapters(data || []);
    } catch (err) {
      console.error('Error fetching YouTube chapters:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chapters');
    } finally {
      setLoading(false);
    }
  };

  // Create new chapters entry
  const createChapters = async (chaptersData: {
    video_url: string;
    video_id: string;
    video_title?: string;
    video_thumbnail?: string;
  }): Promise<YouTubeChapters> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newChapters = {
        ...chaptersData,
        user_id: user.id,
        video_title: chaptersData.video_title || 'YouTube Video',
        status: 'pending' as const,
        chapters_text: '',
        webhook_response: {},
      };

      const { data, error: createError } = await supabase
        .from('youtube_chapters')
        .insert([newChapters])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setChapters(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating chapters:', err);
      throw err;
    }
  };

  // Update existing chapters
  const updateChapters = async (id: string, updates: Partial<YouTubeChapters>): Promise<YouTubeChapters> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: updateError } = await supabase
        .from('youtube_chapters')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      setChapters(prev => 
        prev.map(chaptersItem => chaptersItem.id === id ? { ...chaptersItem, ...data } : chaptersItem)
      );
      return data;
    } catch (err) {
      console.error('Error updating chapters:', err);
      throw err;
    }
  };

  // Delete chapters
  const deleteChapters = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('youtube_chapters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setChapters(prev => prev.filter(chaptersItem => chaptersItem.id !== id));
    } catch (err) {
      console.error('Error deleting chapters:', err);
      throw err;
    }
  };

  // Get chapters by video ID (to check for duplicates)
  const getChaptersByVideoId = (videoId: string): YouTubeChapters | undefined => {
    return chapters.find(chaptersItem => chaptersItem.video_id === videoId);
  };

  // Mark chapters as completed with text content
  const completeChapters = async (id: string, chaptersText: string, webhookResponse?: any): Promise<YouTubeChapters> => {
    return updateChapters(id, {
      status: 'completed',
      chapters_text: chaptersText,
      webhook_response: webhookResponse || {},
    });
  };

  // Mark chapters as failed
  const failChapters = async (id: string, error?: string): Promise<YouTubeChapters> => {
    return updateChapters(id, {
      status: 'failed',
      webhook_response: { error: error || 'Chapter generation failed' },
    });
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchChapters();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('youtube_chapters_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'youtube_chapters',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time YouTube chapters update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setChapters(prev => [payload.new as YouTubeChapters, ...prev]);
              break;
            case 'UPDATE':
              setChapters(prev => 
                prev.map(chaptersItem => 
                  chaptersItem.id === payload.new.id ? payload.new as YouTubeChapters : chaptersItem
                )
              );
              break;
            case 'DELETE':
              setChapters(prev => prev.filter(chaptersItem => chaptersItem.id !== payload.old.id));
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
    chapters,
    loading,
    error,
    createChapters,
    updateChapters,
    deleteChapters,
    getChaptersByVideoId,
    completeChapters,
    failChapters,
    refetch: fetchChapters,
  };
}