
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useFeatureUpvote = (user: any, safeNavigate: (path: string, options: any) => void) => {
  const checkPendingUpvote = async () => {
    const pendingFeatureId = localStorage.getItem('pendingFeatureId') || localStorage.getItem('pendingFeatureUpvote');
    
    if (pendingFeatureId && user) {
      try {
        console.log(`[AuthProvider] Processing pending upvote for feature: ${pendingFeatureId}`);
        
        const { data: existingVote, error: checkError } = await supabase
          .from('feature_upvotes')
          .select('id')
          .eq('feature_id', pendingFeatureId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (!existingVote) {
          const { error: voteError } = await supabase
            .from('feature_upvotes')
            .insert([{
              feature_id: pendingFeatureId,
              user_id: user.id
            }]);
          
          if (voteError) throw voteError;
          
          toast.success('Your vote has been recorded!');
        } else {
          toast.info('You have already voted for this feature');
        }
        
        localStorage.removeItem('pendingFeatureId');
        localStorage.removeItem('pendingFeatureUpvote');
        
        safeNavigate('/dashboard/family', { skipCheck: true });
      } catch (error: any) {
        console.error('[AuthProvider] Error handling pending upvote:', error);
        toast.error(error.message || 'Failed to process your vote');
      }
    }
  };

  return { checkPendingUpvote };
};
