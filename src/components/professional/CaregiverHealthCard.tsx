
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, Users, ShoppingBag, HeartHandshake, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { FadeIn } from "@/components/framer";

interface CaregiverHealthCardProps {
  className?: string;
}

export function CaregiverHealthCard({
  className
}: CaregiverHealthCardProps) {
  const { user } = useAuth();
  
  const handleRequestClick = () => {
    if (!user) {
      toast.info("Please log in or register", {
        description: "You need to be logged in to request support services.",
        duration: 5000,
      });
    }
  };
  
  return (
    <FadeIn 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary-300 bg-gradient-to-br from-blue-50 to-primary-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-100 p-2 text-primary-700">
                <HandHeart className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-primary-800">Caregiver Health</CardTitle>
                <CardDescription className="text-primary-600">
                  Support your well-being while caring for others
                </CardDescription>
              </div>
            </div>
            <Link to="/caregiver/health" onClick={user ? undefined : handleRequestClick}>
              <Button variant="outline" className="border-primary-200 text-primary-700 hover:bg-primary-100">
                Explore Support
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-md border border-primary-100 bg-white p-3 transition-colors hover:bg-primary-50">
              <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Presence Support</h4>
                <p className="text-sm text-gray-600">
                  Someone to be with you during emotionally hard caregiving moments, or join a care circle
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-md border border-primary-100 bg-white p-3 transition-colors hover:bg-primary-50">
              <div className="rounded-full bg-green-100 p-1.5 text-green-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Errand Circle</h4>
                <p className="text-sm text-gray-600">
                  Get help or offer help with simple errands like food drops or pharmacy pickups
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-md border border-primary-100 bg-white p-3 transition-colors hover:bg-primary-50">
              <div className="rounded-full bg-amber-100 p-1.5 text-amber-600">
                <Footprints className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Companion Matching</h4>
                <p className="text-sm text-gray-600">
                  Connect with someone who also wants company (e.g. beach, garden walk or chat)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-md border border-primary-100 bg-white p-3 transition-colors hover:bg-primary-50">
              <div className="rounded-full bg-purple-100 p-1.5 text-purple-600">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Emotional Co-Care</h4>
                <p className="text-sm text-gray-600">
                  You do the caregiving task, they show up and hold space
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
