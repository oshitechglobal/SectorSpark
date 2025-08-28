export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface ContentPiece {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  stage: ContentStage;
  platform: Platform;
  priority: Priority;
  due_date?: string;
  outline?: string;
  hook?: string;
  attention_value?: string;
  will_share?: boolean;
  video_url?: string;
  thumbnail_url?: string;
  gamma_url?: string;
  gamma_pdf_url?: string;
  skool_post?: string;
  email_content?: string;
  lead_magnets: LeadMagnet[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LeadMagnet {
  name: string;
  url: string;
}

export type ContentStage = 'idea' | 'outline' | 'writing' | 'design' | 'film' | 'edit' | 'publish';

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'blog' | 'podcast';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  videos_posted: number;
  shorts_posted: number;
  reels_posted: number;
  tiktoks_posted: number;
  tweets_posted: number;
  linkedin_posts: number;
  blog_posts: number;
  podcast_episodes: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  subscriber_growth: number;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyActivityReport {
  id: string;
  user_id: string;
  date: string;
  activity_summary: string;
  key_achievements: string[];
  challenges_faced: string[];
  tomorrow_goals: string[];
  mood_rating: number;
  productivity_rating: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  platformDistribution: PlatformData[];
  productivityMetrics: ProductivityMetrics;
  pipelineFlow: PipelineFlowData[];
}

export interface PlatformData {
  platform: Platform;
  count: number;
  percentage: number;
}

export interface ProductivityMetrics {
  completionRate: number;
  qualityScore: number;
  activeProjects: number;
  weeklyEfficiency: number;
}

export interface PipelineFlowData {
  stage: ContentStage;
  count: number;
  flow: number;
}

export type ViewMode = 'board' | 'calendar' | 'analytics';