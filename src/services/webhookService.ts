import { ContentPiece, ContentStage } from '../types';
import { supabase } from '../lib/supabase';

export interface StageChangeWebhookPayload {
  event: 'stage_change';
  timestamp: string;
  user_profile: {
    id: string;
    email: string;
    created_at: string;
  };
  content_piece: ContentPiece;
  stage_change: {
    from: ContentStage;
    to: ContentStage;
  };
}

export class WebhookService {
  private static readonly WEBHOOK_URL = 'https://hook.us1.make.com/mivkhgehqdhuhnh1m5pywx7n5axawld8';

  /**
   * Send stage change notification to webhook
   */
  static async sendStageChangeNotification(
    contentPiece: ContentPiece,
    fromStage: ContentStage,
    toStage: ContentStage
  ): Promise<void> {
    try {
      // Get current user profile
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Failed to get user for webhook:', userError);
        return;
      }

      // Prepare webhook payload
      const payload: StageChangeWebhookPayload = {
        event: 'stage_change',
        timestamp: new Date().toISOString(),
        user_profile: {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
        },
        content_piece: contentPiece,
        stage_change: {
          from: fromStage,
          to: toStage,
        },
      };

      // Send webhook request
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      console.log('Stage change webhook sent successfully:', {
        contentId: contentPiece.id,
        title: contentPiece.title,
        from: fromStage,
        to: toStage,
      });

    } catch (error) {
      console.error('Failed to send stage change webhook:', error);
      // Don't throw the error to avoid breaking the UI flow
      // The stage change should still work even if webhook fails
    }
  }

  /**
   * Test webhook connectivity
   */
  static async testWebhook(): Promise<boolean> {
    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'Webhook connectivity test from Infinitum',
      };

      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}