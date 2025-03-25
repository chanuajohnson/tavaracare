
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface IncompleteProfileBannerProps {
  userRole: string;
}

export const IncompleteProfileBanner = ({ userRole }: IncompleteProfileBannerProps) => {
  const navigate = useNavigate();
  
  const handleCompleteProfile = () => {
    navigate(`/registration/${userRole.toLowerCase()}`);
  };
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Your profile is incomplete</h3>
            <p className="text-sm text-amber-700">
              Complete your profile to unlock all features and get matched with the right {userRole === 'professional' ? 'families' : 'professionals'}.
            </p>
          </div>
        </div>
        <Button 
          variant="secondary"
          className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
          onClick={handleCompleteProfile}
        >
          Complete Profile
        </Button>
      </div>
    </div>
  );
};

export default IncompleteProfileBanner;
