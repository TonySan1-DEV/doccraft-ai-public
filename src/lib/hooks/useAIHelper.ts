import { useState } from 'react';
import { runAIAction } from '../../services/aiHelperService';
import { useMCP } from '../../useMCP';

export function useAIHelper() {
  const [loading, setLoading] = useState(false);
  const mcpContext = useMCP('hooks/useAIHelper.ts');

  const runAI = async (
    action: 'rewrite' | 'summarize' | 'suggest',
    text: string
  ): Promise<string> => {
    if (!text.trim()) {
      return '';
    }

    setLoading(true);

    try {
      // Get current user ID
      const {
        data: { user },
      } = await import('../../lib/supabase').then(m =>
        m.supabase.auth.getUser()
      );
      const userId = (user?.id as string) || 'anonymous';

      const result = await runAIAction(action, text, userId, {
        tier: (mcpContext.tier ?? 'Free') as
          | 'Free'
          | 'Pro'
          | 'Enterprise'
          | 'Admin',
        role: (mcpContext.role ?? 'user') as
          | 'user'
          | 'admin'
          | 'moderator'
          | 'analyst',
        allowedActions: mcpContext.allowedActions || [],
      });
      return result;
    } catch (error) {
      console.error('AI helper error:', error);
      // Return original text on error to avoid breaking user experience
      return text;
    } finally {
      setLoading(false);
    }
  };

  return {
    runAI,
    loading,
  };
}
