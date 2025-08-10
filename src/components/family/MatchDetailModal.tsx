import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  Video, 
  Clock, 
  Users, 
  Award,
  Calendar,
  CheckCircle
} from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";

interface Caregiver {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  care_types?: string[] | null;
  years_of_experience?: string | null;
  match_score: number;
  is_premium?: boolean;
}

interface MatchDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: Caregiver | null;
  onStartChat?: () => void;
}

export const MatchDetailModal = ({ 
  open, 
  onOpenChange, 
  caregiver,
  onStartChat
}: MatchDetailModalProps) => {
  if (!caregiver) return null;

  const compatibilityItems = [
    { label: "Care Types Match", score: 95, description: "Specializes in your needed care types" },
    { label: "Schedule Compatibility", score: 88, description: "Available during your preferred hours" },
    { label: "Location Proximity", score: 92, description: "Within 15 minutes of your location" },
    { label: "Experience Level", score: 90, description: "5+ years in senior care" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Caregiver Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 space-y-6">
            {/* Header Card */}
            <Card className={`${caregiver.is_premium ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                      <AvatarImage src={caregiver.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        <Users className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-3 text-center">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg">
                        {caregiver.match_score}% Match
                      </div>
                      {caregiver.is_premium && (
                        <Badge className="mt-2 bg-amber-500 text-white">Premium</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Professional Caregiver</h3>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{caregiver.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>{caregiver.years_of_experience} experience</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="h-5 w-5 text-amber-400 fill-current" />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">4.9 (127 reviews)</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={onStartChat} className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                      <SubscriptionFeatureLink
                        featureType="Video Call Access"
                        returnPath="/family/matching"
                        referringPagePath="/family/matching"
                        referringPageLabel="Caregiver Matching"
                        variant="outline"
                        className="w-full"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </SubscriptionFeatureLink>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compatibility Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Why This is a Great Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {compatibilityItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-sm font-bold text-primary">{item.score}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Specialties & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Care Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {caregiver.care_types?.map((type, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Weekdays</span>
                      <span className="text-green-600 font-medium">Available</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weekends</span>
                      <span className="text-green-600 font-medium">Available</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overnight</span>
                      <span className="text-green-600 font-medium">Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Protected Information Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Privacy Protected</h4>
                    <p className="text-sm text-blue-800">
                      Full name, contact information, and additional details are revealed after starting a conversation 
                      or upgrading to premium features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};