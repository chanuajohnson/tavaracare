import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SubscriptionFeatureLinkProps {
  featureType: string;
  returnPath: string;
  referringPagePath: string;
  referringPageLabel: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const SubscriptionFeatureLink = ({ 
  featureType, 
  returnPath, 
  referringPagePath, 
  referringPageLabel, 
  children, 
  variant = "default", 
  size = "default",
  className = ""
}: SubscriptionFeatureLinkProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    const params = new URLSearchParams({
      feature: featureType,
      return: returnPath,
      from: referringPagePath,
      label: referringPageLabel
    });
    
    navigate(`/subscription?${params.toString()}`);
  };

  // Handle special messaging features
  const getDisplayText = () => {
    if (featureType === "Premium Matching Service 💬") {
      return "Browse All Matches";
    }
    if (featureType === "Unlimited Messaging") {
      return "Unlock Unlimited Messaging";
    }
    return children;
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {getDisplayText()}
    </Button>
  );
};
