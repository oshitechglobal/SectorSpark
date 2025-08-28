import { supabase } from '../lib/supabase';
import { ContentPiece, ContentStage, AnalyticsData } from '../types';

export class ContentService {
  // Get all content pieces for a user
  static async getContentPieces(userId: string): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    return data || [];
  }

  // Get content pieces by stage
  static async getContentByStage(userId: string, stage: ContentStage): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .eq('user_id', userId)
      .eq('stage', stage)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch content by stage: ${error.message}`);
    }

    return data || [];
  }

  // Create new content piece
  static async createContentPiece(contentData: Omit<ContentPiece, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPiece> {
    const { data, error } = await supabase
      .from('content_pieces')
      .insert([{
        ...contentData,
        lead_magnets: contentData.lead_magnets || [],
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create content: ${error.message}`);
    }

    return data;
  }

  // Update content piece
  static async updateContentPiece(id: string, updates: Partial<ContentPiece>): Promise<ContentPiece> {
    const { data, error } = await supabase
      .from('content_pieces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update content: ${error.message}`);
    }

    return data;
  }

  // Delete content piece
  static async deleteContentPiece(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_pieces')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete content: ${error.message}`);
    }
  }

  // Move content to next stage using the database function
  static async moveToNextStage(contentId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('move_content_to_next_stage', { content_id: contentId });

    if (error) {
      throw new Error(`Failed to move content to next stage: ${error.message}`);
    }

    return data;
  }

  // Get analytics data using the database function
  static async getAnalytics(userId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_content_analytics', { user_uuid: userId });

    if (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }

    return data;
  }

  // Batch update content order (for drag & drop reordering)
  static async updateContentOrder(updates: { id: string; order: number; stage: ContentStage }[]): Promise<void> {
    const { error } = await supabase
      .from('content_pieces')
      .upsert(
        updates.map(update => ({
          id: update.id,
          order: update.order,
          stage: update.stage,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

    if (error) {
      throw new Error(`Failed to update content order: ${error.message}`);
    }
  }

  // Search content pieces
  static async searchContent(userId: string, query: string): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,hook.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search content: ${error.message}`);
    }

    return data || [];
  }

  // Get content pieces by date range (for calendar view)
  static async getContentByDateRange(userId: string, startDate: string, endDate: string): Promise<ContentPiece[]> {
    const { data, error } = await supabase
      .from('content_pieces')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch content by date range: ${error.message}`);
    }

    return data || [];
  }

  // Get content statistics for dashboard
  static async getContentStats(userId: string) {
    const { data, error } = await supabase
      .from('content_pieces')
      .select('stage, platform, priority, created_at')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch content stats: ${error.message}`);
    }

    const content = data || [];
    const totalContent = content.length;
    const publishedContent = content.filter(c => c.stage === 'publish').length;
    const thisWeekContent = content.filter(c => {
      const createdAt = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length;

    const platformStats = content.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stageStats = content.reduce((acc, item) => {
      acc[item.stage] = (acc[item.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalContent,
      publishedContent,
      thisWeekContent,
      completionRate: totalContent > 0 ? (publishedContent / totalContent) * 100 : 0,
      platformStats,
      stageStats,
    };
  }
}