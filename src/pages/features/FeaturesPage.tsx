import { useEffect } from "react";
import FeaturesGrid from "@/components/features/FeaturesGrid";
import { Breadcrumb } from "@/components/ui/breadcrumbs/Breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocation } from "react-router-dom";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
const FeaturesPage = () => {
  // Get both clearLastAction and the state we need to check
  const {
    clearLastAction
  } = useAuth();
  const location = useLocation();

  // Only clear pending actions when visiting the features page directly
  // and only if there's actually something to clear
  useEffect(() => {
    // Check localStorage directly to avoid causing state changes and re-renders
    // when no action exists to be cleared
    const hasLastAction = localStorage.getItem('lastAction') || localStorage.getItem('lastPath') || localStorage.getItem('pendingFeatureId') || localStorage.getItem('pendingFeatureUpvote') || localStorage.getItem('pendingBooking') || localStorage.getItem('pendingMessage') || localStorage.getItem('pendingProfileUpdate');

    // Skip entirely if coming from navigation paths or if there's nothing to clear
    const fromNavigation = document.referrer.includes('/dashboard') || document.referrer.includes('/community') || document.referrer === '';
    if (hasLastAction && !fromNavigation) {
      console.log('[FeaturesPage] Clearing last action');
      // Use a setTimeout to delay the clear action slightly, giving the page time to render first
      setTimeout(() => {
        clearLastAction();
      }, 100);
    } else {
      console.log('[FeaturesPage] No last action to clear or coming from navigation - skipping');
    }
  }, [clearLastAction, location.pathname]);
  return <div className="min-h-screen bg-gray-50">
      <PageViewTracker actionType="features_page_view" />
      
      <div className="container px-4 py-12 mx-auto">
        <Breadcrumb />
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feature Roadmap
          </h1>
          <p className="text-lg text-gray-600 mb-8">Help shape the future of Tavara by voting for features you'd like to see next. Your feedback helps us prioritize what to build.</p>
        </div>

        <FeaturesGrid />
      </div>
    </div>;
};
export default FeaturesPage;