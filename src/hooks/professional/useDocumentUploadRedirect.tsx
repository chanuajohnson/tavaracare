
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useTracking } from '@/hooks/useTracking';

export function useDocumentUploadRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackEngagement } = useTracking();
  const [hasExistingUploads, setHasExistingUploads] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExistingUploads = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('professional_documents')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error checking existing uploads:', error);
          setHasExistingUploads(false);
        } else {
          setHasExistingUploads((data || []).length > 0);
        }
      } catch (error) {
        console.error('Error in checkExistingUploads:', error);
        setHasExistingUploads(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingUploads();
  }, [user]);

  const redirectToDocumentUpload = () => {
    trackEngagement('upload_documents_redirect', { 
      step: 'certificates',
      has_existing_uploads: hasExistingUploads 
    });
    
    navigate('/professional/profile?tab=documents');
  };

  const getUploadButtonText = () => {
    return hasExistingUploads ? 'Continue with your upload' : 'Upload here';
  };

  return {
    hasExistingUploads,
    isLoading,
    redirectToDocumentUpload,
    getUploadButtonText
  };
}
