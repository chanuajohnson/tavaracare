
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Calendar, 
  UserPlus, 
  MessageSquare, 
  FileText, 
  Pill,
  Utensils,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFamilyProgress } from "@/components/tav/hooks/useFamilyProgress";

export const FamilyShortcutMenuBar = () => {
  const navigate = useNavigate();
  const { visitDetails } = useFamilyProgress();
  
  // Check if there's a scheduled visit
  const hasScheduledVisit = visitDetails && visitDetails.is_admin_scheduled;

  const scrollToVisitCard = () => {
    // Scroll to the visit acceptance card on the dashboard
    const visitCard = document.querySelector('[data-testid="visit-acceptance-card"]');
    if (visitCard) {
      visitCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Visit Scheduled - Show prominently when available */}
        {hasScheduledVisit && (
          <Button
            variant="default"
            size="sm"
            onClick={scrollToVisitCard}
            className="flex flex-col items-center justify-center h-20 bg-blue-600 hover:bg-blue-700 text-white relative"
          >
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs text-center leading-tight">
              Visit Scheduled
            </span>
            <span className="text-xs text-blue-100 font-normal">
              {new Date(visitDetails.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </Button>
        )}

        {/* Care Assessment */}
        <Link to="/family/care-assessment">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center justify-center h-20 w-full hover:bg-gray-50"
          >
            <FileText className="h-5 w-5 mb-1 text-blue-600" />
            <span className="text-xs text-center leading-tight">Care Assessment</span>
          </Button>
        </Link>

        {/* Legacy Story */}
        <Link to="/family/story">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center justify-center h-20 w-full hover:bg-gray-50"
          >
            <Heart className="h-5 w-5 mb-1 text-pink-600" />
            <span className="text-xs text-center leading-tight">Their Story</span>
          </Button>
        </Link>

        {/* Find Caregivers */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/family/caregiver-matches')}
          className="flex flex-col items-center justify-center h-20 hover:bg-gray-50"
        >
          <UserPlus className="h-5 w-5 mb-1 text-green-600" />
          <span className="text-xs text-center leading-tight">Find Caregivers</span>
        </Button>

        {/* Medications */}
        <Link to="/family/care-management">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center justify-center h-20 w-full hover:bg-gray-50"
          >
            <Pill className="h-5 w-5 mb-1 text-purple-600" />
            <span className="text-xs text-center leading-tight">Medications</span>
          </Button>
        </Link>

        {/* Meal Planning */}
        <Link to="/family/care-management">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center justify-center h-20 w-full hover:bg-gray-50"
          >
            <Utensils className="h-5 w-5 mb-1 text-orange-600" />
            <span className="text-xs text-center leading-tight">Meal Planning</span>
          </Button>
        </Link>

        {/* Care Journey Progress */}
        <Link to="/family/care-journey-progress">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center justify-center h-20 w-full hover:bg-gray-50"
          >
            <CheckCircle2 className="h-5 w-5 mb-1 text-blue-600" />
            <span className="text-xs text-center leading-tight">Journey Progress</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
