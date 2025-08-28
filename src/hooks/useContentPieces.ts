import { useState, useEffect } from 'react';
import { ContentPiece, ContentStage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { WebhookService } from '../services/webhookService';

export function useContentPieces() {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all content pieces for the current user
  const fetchContent = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('content_pieces')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setContent(data || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  // Create new content piece
  const createContent = async (contentData: Partial<ContentPiece>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newContent = {
        ...contentData,
        user_id: user.id,
        lead_magnets: contentData.lead_magnets || [],
        order: contentData.order || 0,
      };

      const { data, error: createError } = await supabase
        .from('content_pieces')
        .insert([newContent])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Optimistically update local state
      setContent(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating content:', err);
      throw err;
    }
  };

  // Update existing content piece
  const updateContent = async (id: string, updates: Partial<ContentPiece>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: updateError } = await supabase
        .from('content_pieces')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Optimistically update local state
      setContent(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
      return data;
    } catch (err) {
      console.error('Error updating content:', err);
      throw err;
    }
  };

  // Delete content piece
  const deleteContent = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('content_pieces')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Optimistically update local state
      setContent(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting content:', err);
      throw err;
    }
  };

  // Move content to different stage (for drag & drop)
  const moveContentToStage = async (id: string, newStage: ContentStage, newOrder?: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get the current content piece to track the stage change
      const currentContent = content.find(item => item.id === id);
      if (!currentContent) {
        throw new Error('Content piece not found');
      }

      const oldStage = currentContent.stage;
      
      const updates: Partial<ContentPiece> = { 
        stage: newStage,
        ...(newOrder !== undefined && { order: newOrder })
      };

      const { data, error: updateError } = await supabase
        .from('content_pieces')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Send webhook notification if stage actually changed
      if (oldStage !== newStage) {
        // Send webhook in the background (don't await to avoid blocking UI)
        WebhookService.sendStageChangeNotification(data, oldStage, newStage)
          .catch(error => {
            console.error('Webhook notification failed:', error);
            // Don't throw - webhook failure shouldn't break the stage change
          });
      }

      // Optimistically update local state
      setContent(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
      return data;
    } catch (err) {
      console.error('Error moving content:', err);
      throw err;
    }
  };

  // Get content by stage
  const getContentByStage = (stage: ContentStage) => {
    return content.filter(item => item.stage === stage);
  };

  // Get content analytics
  const getAnalytics = () => {
    const totalContent = content.length;
    const publishedContent = content.filter(c => c.stage === 'publish').length;
    const completionRate = totalContent > 0 ? (publishedContent / totalContent) * 100 : 0;

    const platformDistribution = content.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stageDistribution = content.reduce((acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalContent,
      publishedContent,
      completionRate,
      platformDistribution,
      stageDistribution,
    };
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchContent();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('content_pieces_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_pieces',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setContent(prev => [...prev, payload.new as ContentPiece]);
              break;
            case 'UPDATE':
              setContent(prev => 
                prev.map(item => 
                  item.id === payload.new.id ? payload.new as ContentPiece : item
                )
              );
              break;
            case 'DELETE':
              setContent(prev => prev.filter(item => item.id !== payload.old.id));
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
    content,
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    moveContentToStage,
    getContentByStage,
    getAnalytics,
    refetch: fetchContent,
  };
}