import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import {
  VideoRevenueGeneration,
  VideoRevenueNewsletterEmail,
  VideoRevenueSkoolPost,
  VideoRevenueLinkedInPost,
  CreateVideoRevenueGenerationData,
  VideoRevenuePipelineData,
  VideoRevenueStatus
} from '../types/videoRevenue';

export function useVideoRevenue() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<VideoRevenueGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all generations for the current user
  const fetchGenerations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('video_revenue_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setGenerations(data || []);
    } catch (err) {
      console.error('Error fetching video revenue generations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch generations');
    } finally {
      setLoading(false);
    }
  };

  // Create new generation
  const createGeneration = async (generationData: CreateVideoRevenueGenerationData): Promise<VideoRevenueGeneration> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newGeneration = {
        ...generationData,
        user_id: user.id,
        key_insights: generationData.key_insights || [],
        status: generationData.status || 'draft',
        is_favorite: generationData.is_favorite || false,
      };

      const { data, error: createError } = await supabase
        .from('video_revenue_generations')
        .insert([newGeneration])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setGenerations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating generation:', err);
      throw err;
    }
  };

  // Update existing generation
  const updateGeneration = async (id: string, updates: Partial<VideoRevenueGeneration>): Promise<VideoRevenueGeneration> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: updateError } = await supabase
        .from('video_revenue_generations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      setGenerations(prev => 
        prev.map(generation => generation.id === id ? { ...generation, ...data } : generation)
      );
      return data;
    } catch (err) {
      console.error('Error updating generation:', err);
      throw err;
    }
  };

  // Delete generation
  const deleteGeneration = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('video_revenue_generations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setGenerations(prev => prev.filter(generation => generation.id !== id));
    } catch (err) {
      console.error('Error deleting generation:', err);
      throw err;
    }
  };

  // Get complete pipeline data for a generation
  const getPipelineData = async (generationId: string): Promise<VideoRevenuePipelineData> => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Fetch generation
      const { data: generation, error: generationError } = await supabase
        .from('video_revenue_generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user.id)
        .single();

      if (generationError) throw generationError;

      // Fetch newsletter emails
      const { data: newsletterEmails, error: emailsError } = await supabase
        .from('video_revenue_newsletter_emails')
        .select('*')
        .eq('generation_id', generationId)
        .eq('user_id', user.id)
        .order('email_number', { ascending: true });

      if (emailsError) throw emailsError;

      // Fetch Skool posts
      const { data: skoolPosts, error: skoolError } = await supabase
        .from('video_revenue_skool_posts')
        .select('*')
        .eq('generation_id', generationId)
        .eq('user_id', user.id)
        .order('post_number', { ascending: true });

      if (skoolError) throw skoolError;

      // Fetch LinkedIn posts
      const { data: linkedinPosts, error: linkedinError } = await supabase
        .from('video_revenue_linkedin_posts')
        .select('*')
        .eq('generation_id', generationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (linkedinError) throw linkedinError;

      return {
        generation,
        newsletterEmails: newsletterEmails || [],
        skoolPosts: skoolPosts || [],
        linkedinPosts: linkedinPosts || [],
      };
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
      throw err;
    }
  };

  // Create newsletter email
  const createNewsletterEmail = async (emailData: Omit<VideoRevenueNewsletterEmail, 'id' | 'user_id' | 'created_at'>): Promise<VideoRevenueNewsletterEmail> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newEmail = {
        ...emailData,
        user_id: user.id,
      };

      const { data, error: createError } = await supabase
        .from('video_revenue_newsletter_emails')
        .insert([newEmail])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return data;
    } catch (err) {
      console.error('Error creating newsletter email:', err);
      throw err;
    }
  };

  // Create Skool post
  const createSkoolPost = async (postData: Omit<VideoRevenueSkoolPost, 'id' | 'user_id' | 'created_at'>): Promise<VideoRevenueSkoolPost> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newPost = {
        ...postData,
        user_id: user.id,
      };

      const { data, error: createError } = await supabase
        .from('video_revenue_skool_posts')
        .insert([newPost])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return data;
    } catch (err) {
      console.error('Error creating Skool post:', err);
      throw err;
    }
  };

  // Create LinkedIn post
  const createLinkedInPost = async (postData: Omit<VideoRevenueLinkedInPost, 'id' | 'user_id' | 'created_at'>): Promise<VideoRevenueLinkedInPost> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newPost = {
        ...postData,
        user_id: user.id,
      };

      const { data, error: createError } = await supabase
        .from('video_revenue_linkedin_posts')
        .insert([newPost])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return data;
    } catch (err) {
      console.error('Error creating LinkedIn post:', err);
      throw err;
    }
  };

  // Get generations by status
  const getGenerationsByStatus = (status: VideoRevenueStatus): VideoRevenueGeneration[] => {
    return generations.filter(generation => generation.status === status);
  };

  // Get favorite generations
  const getFavoriteGenerations = (): VideoRevenueGeneration[] => {
    return generations.filter(generation => generation.is_favorite);
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string): Promise<void> => {
    const generation = generations.find(g => g.id === id);
    if (!generation) return;

    await updateGeneration(id, { is_favorite: !generation.is_favorite });
  };

  // Get generation statistics
  const getGenerationStats = () => {
    const totalGenerations = generations.length;
    const draftCount = generations.filter(g => g.status === 'draft').length;
    const readyCount = generations.filter(g => g.status === 'ready').length;
    const publishedCount = generations.filter(g => g.status === 'published').length;
    const archivedCount = generations.filter(g => g.status === 'archived').length;
    const favoriteCount = generations.filter(g => g.is_favorite).length;

    return {
      totalGenerations,
      draftCount,
      readyCount,
      publishedCount,
      archivedCount,
      favoriteCount,
    };
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchGenerations();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('video_revenue_generations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_revenue_generations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time video revenue generation update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setGenerations(prev => [payload.new as VideoRevenueGeneration, ...prev]);
              break;
            case 'UPDATE':
              setGenerations(prev => 
                prev.map(generation => 
                  generation.id === payload.new.id ? payload.new as VideoRevenueGeneration : generation
                )
              );
              break;
            case 'DELETE':
              setGenerations(prev => prev.filter(generation => generation.id !== payload.old.id));
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
    generations,
    loading,
    error,
    createGeneration,
    updateGeneration,
    deleteGeneration,
    getPipelineData,
    createNewsletterEmail,
    createSkoolPost,
    createLinkedInPost,
    getGenerationsByStatus,
    getFavoriteGenerations,
    toggleFavorite,
    getGenerationStats,
    refetch: fetchGenerations,
  };
}