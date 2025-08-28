// Video-to-Revenue Pipeline TypeScript Interfaces

export interface VideoRevenueGeneration {
  id: string;
  user_id: string;
  video_url: string;
  video_title: string;
  video_description?: string;
  template_resource: string;
  key_insights: string[];
  main_teaching?: string;
  featured_template?: string;
  newsletter_cta?: string;
  newsletter_tone?: string;
  free_community_cta?: string;
  free_community_tone?: string;
  paid_community_cta?: string;
  paid_community_tone?: string;
  linkedin_keyword?: string;
  status: 'draft' | 'ready' | 'published' | 'archived';
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoRevenueNewsletterEmail {
  id: string;
  user_id: string;
  generation_id: string;
  email_number: number;
  configured_tone?: string;
  configured_cta?: string;
  subject_line?: string;
  content?: string;
  cta_integration?: string;
  created_at: string;
}

export interface VideoRevenueSkoolPost {
  id: string;
  user_id: string;
  generation_id: string;
  community: 'Free' | 'Paid';
  post_number: number;
  configured_tone?: string;
  configured_cta?: string;
  content?: string;
  cta_integration?: string;
  created_at: string;
}

export interface VideoRevenueLinkedInPost {
  id: string;
  user_id: string;
  generation_id: string;
  variation: string;
  configured_tone?: string;
  configured_keyword?: string;
  hook?: string;
  content?: string;
  cta_line?: string;
  created_at: string;
}

export interface CreateVideoRevenueGenerationData {
  video_url: string;
  video_title: string;
  video_description?: string;
  template_resource: string;
  key_insights?: string[];
  main_teaching?: string;
  featured_template?: string;
  newsletter_cta?: string;
  newsletter_tone?: string;
  free_community_cta?: string;
  free_community_tone?: string;
  paid_community_cta?: string;
  paid_community_tone?: string;
  linkedin_keyword?: string;
  status?: 'draft' | 'ready' | 'published' | 'archived';
  is_favorite?: boolean;
}

export interface VideoRevenuePipelineData {
  generation: VideoRevenueGeneration;
  newsletterEmails: VideoRevenueNewsletterEmail[];
  skoolPosts: VideoRevenueSkoolPost[];
  linkedinPosts: VideoRevenueLinkedInPost[];
}

export type VideoRevenueStatus = 'draft' | 'ready' | 'published' | 'archived';
export type SkoolCommunityType = 'Free' | 'Paid';