
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatbotConversation } from '@/types/chatbotTypes';

export function useChatbotPrefill(role?: 'family' | 'professional' | 'community') {
  const location = useLocation();
  const navigate = useNavigate();
  const [prefillData, setPrefillData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse prefill data from URL if present
    const searchParams = new URLSearchParams(location.search);
    const prefillParam = searchParams.get('prefill');
    
    if (prefillParam) {
      try {
        const decodedParam = decodeURIComponent(prefillParam);
        const parsedData = JSON.parse(decodedParam);
        
        // If role is specified, check that the data is for this role
        if (!role || parsedData.userRole === role) {
          setPrefillData(parsedData);
        }
      } catch (e) {
        console.error('Error parsing prefill data:', e);
      }
    }
    
    setLoading(false);
  }, [location.search, role]);

  // Function to create a prefill URL for a specific registration form
  const createPrefillUrl = (
    data: Record<string, any>, 
    targetRole: 'family' | 'professional' | 'community'
  ): string => {
    const prefillJson = JSON.stringify(data);
    const encodedJson = encodeURIComponent(prefillJson);
    return `/registration/${targetRole}?prefill=${encodedJson}`;
  };

  // Navigate to a registration form with prefill data
  const navigateWithPrefill = (
    data: Record<string, any> | ChatbotConversation, 
    targetRole: 'family' | 'professional' | 'community'
  ) => {
    const prefillData = 'userRole' in data ? 
      // It's a ChatbotConversation
      { 
        ...data.contactInfo,
        ...data.careNeeds,
        userRole: data.userRole
      } : 
      // It's already in the right format
      data;
    
    const url = createPrefillUrl(prefillData, targetRole);
    navigate(url);
  };

  return {
    prefillData,
    loading,
    createPrefillUrl,
    navigateWithPrefill
  };
}
