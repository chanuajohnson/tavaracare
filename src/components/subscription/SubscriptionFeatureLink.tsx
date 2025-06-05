
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';

interface SubscriptionFeatureLinkProps {
  /**
   * The name of the premium feature being accessed
   */
  featureType: string;
  
  /**
   * Path to return to after subscription flow (usually the current feature path)
   */
  returnPath: string;
  
  /**
   * Path of the referring page (where this link appears)
   */
  referringPagePath: string;
  
  /**
   * Label for the referring page (for breadcrumbs)
   */
  referringPageLabel: string;
  
  /**
   * Children to render inside the button
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Button variant
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  
  /**
   * Skip the features page and go directly to subscription page
   */
  directToSubscription?: boolean;
}

export const SubscriptionFeatureLink = ({
  featureType,
  returnPath,
  referringPagePath,
  referringPageLabel,
  children,
  className,
  variant = "default",
  directToSubscription = false
}: SubscriptionFeatureLinkProps) => {
  const { user, userRole } = useAuth();
  
  // Determine proper destination - features page or direct to subscription
  const destinationPath = directToSubscription ? "/subscription" : "/subscription-features";
  
  // Determine if this is for a professional feature
  const isProfessionalFeature = 
    userRole === 'professional' || 
    referringPagePath.includes('professional') || 
    returnPath.includes('professional');
    
  // For specific redirects, ensure we have a valid return path
  const safeReturnPath = 
    // Professional jobs page should redirect to professional dashboard
    returnPath === "/professional/jobs" 
      ? "/dashboard/professional" 
      // Family matching should use referringPath when coming from a dashboard
      : (returnPath === "/family-matching" && referringPagePath.includes("dashboard"))
        ? returnPath 
        // Care Need Posting should have valid return path
        : (returnPath === "/family/post-care-need")
          ? returnPath
          : returnPath;
  
  // Log the link information for debugging
  console.log('SubscriptionFeatureLink:', {
    featureType,
    returnPath: safeReturnPath,
    referringPagePath,
    referringPageLabel,
    isProfessionalFeature
  });
  
  return (
    <Link
      to={destinationPath}
      state={{
        featureType,
        returnPath: safeReturnPath,
        referringPagePath,
        referringPageLabel,
        directSubscription: directToSubscription,
        fromProfessionalFeatures: isProfessionalFeature
      }}
      className={className}
    >
      <Button 
        className="w-full"
        variant={variant}
      >
        {children || (user ? "Upgrade to Access" : "Subscribe to Access")}
      </Button>
    </Link>
  );
};
