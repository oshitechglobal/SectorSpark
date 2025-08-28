import { useState, useEffect, useCallback } from 'react';
import { DailyProgressEntry, PlatformType, PlatformMetrics, ProgressStats } from '../types/progress';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useDailyProgress() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<DailyProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all progress data for the current user
  const fetchProgressData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProgressData(data || []);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get progress data for a specific date
  const getProgressForDate = useCallback((date: string): DailyProgressEntry[] => {
    return progressData.filter(entry => entry.date === date);
  }, [progressData]);

  // Get progress data for a specific date and platform
  const getProgressForDateAndPlatform = useCallback((date: string, platform: PlatformType): DailyProgressEntry | undefined => {
    return progressData.find(entry => entry.date === date && entry.platform === platform);
  }, [progressData]);

  // Save or update progress entry
  const saveProgressEntry = async (
    date: string,
    platform: PlatformType,
    metrics: PlatformMetrics
  ): Promise<DailyProgressEntry> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const existingEntry = getProgressForDateAndPlatform(date, platform);

      if (existingEntry) {
        // Update existing entry
        const { data, error: updateError } = await supabase
          .from('daily_progress')
          .update({ metrics })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        setProgressData(prev => 
          prev.map(entry => entry.id === existingEntry.id ? data : entry)
        );

        return data;
      } else {
        // Create new entry
        const { data, error: insertError } = await supabase
          .from('daily_progress')
          .insert([{
            user_id: user.id,
            date,
            platform,
            metrics
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        setProgressData(prev => [data, ...prev]);

        return data;
      }
    } catch (err) {
      console.error('Error saving progress entry:', err);
      throw err;
    }
  };

  // Delete progress entry
  const deleteProgressEntry = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('daily_progress')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setProgressData(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting progress entry:', err);
      throw err;
    }
  };

  // Get progress statistics
  const getProgressStats = useCallback((): ProgressStats => {
    if (!progressData.length) {
      return {
        totalDays: 0,
        completedDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        platformStats: {} as any,
      };
    }

    // Group by date to calculate completion stats
    const dateGroups = progressData.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, DailyProgressEntry[]>);

    const uniqueDates = Object.keys(dateGroups).sort();
    const totalDays = uniqueDates.length;
    const completedDays = uniqueDates.filter(date => dateGroups[date].length >= 3).length; // At least 3 platforms

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    const sortedDates = uniqueDates.sort().reverse();

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const isComplete = dateGroups[date].length >= 3;

      if (isComplete) {
        tempStreak++;
        if (i === 0 || sortedDates[i - 1] === getPreviousDate(date)) {
          if (date === today || i === 0) {
            currentStreak = tempStreak;
          }
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate platform-specific stats
    const platformStats = {} as ProgressStats['platformStats'];
    const platforms: PlatformType[] = ['youtube', 'skool', 'linkedin', 'instagram', 'twitter', 'email'];

    platforms.forEach(platform => {
      const platformEntries = progressData.filter(entry => entry.platform === platform);
      const latestEntry = platformEntries[0]; // Already sorted by date desc

      platformStats[platform] = {
        totalEntries: platformEntries.length,
        latestMetrics: latestEntry?.metrics || {},
        growth: {
          daily: 0, // TODO: Calculate based on previous day
          weekly: 0, // TODO: Calculate based on previous week
          monthly: 0, // TODO: Calculate based on previous month
        },
      };
    });

    return {
      totalDays,
      completedDays,
      currentStreak,
      longestStreak,
      completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
      platformStats,
    };
  }, [progressData]);

  // Get growth trend data for charts
  const getGrowthTrendData = useCallback((days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0]);
    }

    return dateRange.map(date => {
      const dayData: any = { date };
      const entriesForDate = progressData.filter(entry => entry.date === date);

      entriesForDate.forEach(entry => {
        if (entry.platform === 'youtube') {
          dayData.youtubeSubscribers = entry.metrics.subscribers || 0;
        } else if (entry.platform === 'skool') {
          dayData.skoolMembers = entry.metrics.members || 0;
        } else if (entry.platform === 'linkedin') {
          dayData.linkedinFollowers = entry.metrics.followers || 0;
        } else if (entry.platform === 'instagram') {
          dayData.instagramFollowers = entry.metrics.followers || 0;
        } else if (entry.platform === 'twitter') {
          dayData.twitterFollowers = entry.metrics.followers || 0;
        } else if (entry.platform === 'email') {
          dayData.emailSubscribers = entry.metrics.emailSubscribers || 0;
        }
      });

      return dayData;
    });
  }, [progressData]);

  // Helper function to get previous date
  const getPreviousDate = (dateString: string): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchProgressData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('daily_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time progress update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setProgressData(prev => [payload.new as DailyProgressEntry, ...prev]);
              break;
            case 'UPDATE':
              setProgressData(prev => 
                prev.map(entry => 
                  entry.id === payload.new.id ? payload.new as DailyProgressEntry : entry
                )
              );
              break;
            case 'DELETE':
              setProgressData(prev => prev.filter(entry => entry.id !== payload.old.id));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchProgressData]);

  return {
    progressData,
    loading,
    error,
    getProgressForDate,
    getProgressForDateAndPlatform,
    saveProgressEntry,
    deleteProgressEntry,
    getProgressStats,
    getGrowthTrendData,
    refetch: fetchProgressData,
  };
}