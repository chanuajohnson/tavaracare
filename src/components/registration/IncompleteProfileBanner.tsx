
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

export const IncompleteProfileBanner = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleCompleteProfile = () => {
    navigate(`/registration/${userRole?.toLowerCase()}`);
    toast.success("Let's complete your profile");
  };

  return (
    <Card className="w-full mb-6 border-yellow-300 bg-yellow-50">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Complete your profile to unlock all features and be matched with families.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDismissed(true)}
            className="text-xs"
          >
            Dismiss
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleCompleteProfile}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
          >
            Complete Registration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
