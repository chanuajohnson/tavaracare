
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

interface UpvoteFeatureButtonProps {
  featureTitle: string;
  className?: string;
  featureId?: string;
  buttonText?: string;
}

export const UpvoteFeatureButton = ({ featureTitle, className, featureId: propFeatureId, buttonText = "Upvote" }: UpvoteFeatureButtonProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [featureId, setFeatureId] = useState<string | null>(propFeatureId || null);
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  // Validate if a string is a valid UUID
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // Get or create the feature ID if it doesn't exist
  const getOrCreateFeatureId = async (title: string) => {
    try {
      console.log(`Attempting to get/create feature ID for: "${title}"`);
      
      // First, check if we already have this feature ID stored
      if (featureId && isValidUUID(featureId)) {
        console.log(`Using existing feature ID: ${featureId}`);
        return featureId;
      }
      
      // Check if feature exists in database
      const { data: existingFeature, error: fetchError } = await supabase
        .from('features')
        .select('id')
        .ilike('title', title)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching feature:', fetchError);
        return null;
      }

      if (existingFeature && existingFeature.id) {
        console.log(`Found existing feature with ID: ${existingFeature.id}`);
        setFeatureId(existingFeature.id);
        return existingFeature.id;
      }

      // Create new feature if it doesn't exist
      console.log(`Feature not found, creating new one for: "${title}"`);
      const { data: newFeature, error: insertError } = await supabase
        .from('features')
        .insert([{ title, description: `Feature request for ${title}` }])
        .select('id')
        .maybeSingle();

      if (insertError) {
        console.error('Error creating feature:', insertError);
        return null;
      }
      
      if (newFeature && newFeature.id) {
        console.log(`Created new feature with ID: ${newFeature.id}`);
        setFeatureId(newFeature.id);
        return newFeature.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting/creating feature:', error);
      return null;
    }
  };

  // Check if user has already voted for this feature
  const checkUserVote = async (fId: string) => {
    if (!user || !isValidUUID(fId)) return false;
    
    try {
      console.log(`Checking if user ${user.id} has voted for feature ${fId}`);
      
      const { data, error } = await supabase
        .from('feature_upvotes')
        .select('id')
        .eq('feature_id', fId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user vote:', error);
        return false;
      }

      const hasVoted = !!data;
      console.log(`User ${user.id} has ${hasVoted ? '' : 'not '}voted for feature ${fId}`);
      return hasVoted;
    } catch (error) {
      console.error('Error checking user vote:', error);
      return false;
    }
  };

  // Fetch vote count for the feature
  const fetchVoteCount = async (fId: string) => {
    try {
      if (!isValidUUID(fId)) {
        console.error(`Invalid UUID format for feature ID: ${fId}`);
        return;
      }
      
      console.log(`Fetching vote count for feature ${fId}`);
      
      const { count, error } = await supabase
        .from('feature_upvotes')
        .select('id', { count: 'exact' })
        .eq('feature_id', fId);
      
      if (error) {
        console.error('Error fetching vote count:', error);
        return;
      }
      
      console.log(`Vote count for feature ${fId}: ${count || 0}`);
      setVoteCount(count || 0);
    } catch (error) {
      console.error('Error fetching vote count:', error);
    }
  };

  // Initialize component - get feature ID, check vote status, fetch vote count
  useEffect(() => {
    const initializeFeature = async () => {
      console.log(`Initializing feature component for: "${featureTitle}"`);
      const fId = await getOrCreateFeatureId(featureTitle);
      if (fId && isValidUUID(fId)) {
        await fetchVoteCount(fId);
        if (user) {
          const userHasVoted = await checkUserVote(fId);
          setHasVoted(userHasVoted);
        }
      } else {
        console.error(`Failed to get/create valid feature ID for "${featureTitle}"`);
      }
    };

    initializeFeature();
  }, [featureTitle, user]);

  // Handle upvote click
  const handleUpvote = async () => {
    console.log(`Upvote button clicked for "${featureTitle}"`);
    
    // Get feature ID first
    const fId = await getOrCreateFeatureId(featureTitle);
    if (!fId || !isValidUUID(fId)) {
      console.error(`Could not get/create valid feature ID for "${featureTitle}"`);
      toast.error('Unable to process vote at this time.');
      return;
    }
    
    console.log(`Processing upvote for feature ID: ${fId}`);
    
    // Store the feature ID for post-login handling
    localStorage.setItem('pendingFeatureId', fId);
    localStorage.setItem('pendingFeatureUpvote', fId);
    
    // Check if user is authenticated
    if (!requireAuth(`upvote "${featureTitle}"`)) {
      console.log('User not authenticated, redirecting to auth page');
      toast.error('Please sign in to upvote this feature.');
      return; // requireAuth will handle redirect to login page
    }
    
    // Prevent multiple clicks
    if (isVoting) {
      console.log('Already processing a vote, ignoring click');
      return;
    }
    
    setIsVoting(true);
    
    try {
      if (hasVoted) {
        console.log(`User has already voted for feature ${fId}, removing vote`);
        // Remove vote if user already voted
        const { error } = await supabase
          .from('feature_upvotes')
          .delete()
          .eq('feature_id', fId)
          .eq('user_id', user!.id);

        if (error) {
          console.error('Error removing vote:', error);
          throw error;
        }
        
        setHasVoted(false);
        setVoteCount(prev => Math.max(0, prev - 1));
        toast.success('Your vote has been removed');
      } else {
        console.log(`Adding vote for feature ${fId} by user ${user!.id}`);
        // Add vote
        const { error } = await supabase
          .from('feature_upvotes')
          .insert([{
            feature_id: fId,
            user_id: user!.id
          }]);

        if (error) {
          console.error('Error adding vote:', error);
          throw error;
        }
        
        setHasVoted(true);
        setVoteCount(prev => prev + 1);
        toast.success(`Thank you for voting for "${featureTitle}"!`);
        
        // Navigate to family dashboard after successful vote (changed from features page)
        console.log('Navigating to family dashboard');
        navigate('/dashboard/family');
      }
    } catch (error: any) {
      console.error('Error handling vote:', error);
      toast.error(error.message || 'Failed to process your vote. Please try again.');
    } finally {
      setIsVoting(false);
      // Clean up local storage after successful vote
      localStorage.removeItem('pendingFeatureId');
      localStorage.removeItem('pendingFeatureUpvote');
    }
  };

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size="sm"
      className={className}
      onClick={handleUpvote}
      disabled={isVoting}
    >
      <ThumbsUp className={`w-4 h-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
      {buttonText} {voteCount > 0 && `(${voteCount})`}
    </Button>
  );
};
