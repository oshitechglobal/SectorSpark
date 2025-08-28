export interface DailyProgressEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  platform: PlatformType;
  metrics: PlatformMetrics;
  created_at: string;
  updated_at: string;
}

export type PlatformType = 'youtube' | 'skool' | 'linkedin' | 'instagram' | 'twitter' | 'email';

export interface PlatformMetrics {
  // YouTube specific
  longFormVideos?: number;
  shorts?: number;
  subscribers?: number;
  
  // Skool specific
  members?: number;
  
  // Social platforms (LinkedIn, Instagram, Twitter)
  posts?: number;
  followers?: number;
  
  // Email specific
  emailSubscribers?: number;
}

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  fields: MetricField[];
}

export interface MetricField {
  key: keyof PlatformMetrics;
  label: string;
  placeholder: string;
}

export interface ProgressStats {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  platformStats: Record<PlatformType, {
    totalEntries: number;
    latestMetrics: PlatformMetrics;
    growth: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  }>;
}

export interface GrowthTrendData {
  date: string;
  [key: string]: string | number; // Platform metrics as dynamic keys
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasData: boolean;
  completionStatus: 'complete' | 'partial' | 'empty';
  platforms: PlatformType[];
}