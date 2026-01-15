import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  MessageCircle, 
  Users, 
  Calendar,
  Shield,
  Clock,
  Heart,
  Briefcase
} from "lucide-react";
import { SpotlightCaregiver } from "@/services/spotlightService";

interface SpotlightCaregiverDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: SpotlightCaregiver | null;
  onWhatsAppChat: (id: string) => void;
}

export const SpotlightCaregiverDetailModal = ({ 
  open, 
  onOpenChange, 
  caregiver,
  onWhatsAppChat
}: SpotlightCaregiverDetailModalProps) => {
  if (!caregiver) return null;

  const handleWhatsAppClick = () => {
    onWhatsAppChat(caregiver.caregiverId);
  };

  // Use firstName if available, otherwise extract from fullName
  const displayName = caregiver.profile.firstName || caregiver.profile.fullName?.split(' ')[0] || "Caregiver";
  const initials = displayName[0]?.toUpperCase() || "C";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Caregiver Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                      <AvatarImage src={caregiver.profile.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-3 text-center space-y-2">
                      {/* Available Now Badge - replacing match percentage */}
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-full font-medium text-sm flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Available Now
                      </div>
                      
                      {/* Verified Badge */}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{displayName}</h3>
                      <p className="text-muted-foreground mb-2">{caregiver.headline}</p>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {(caregiver.profile.location || caregiver.profile.address) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{caregiver.profile.location || caregiver.profile.address}</span>
                          </div>
                        )}
                        {caregiver.profile.yearsOfExperience && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{caregiver.profile.yearsOfExperience} experience</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Single WhatsApp Button */}
                    <Button 
                      onClick={handleWhatsAppClick} 
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About This Caregiver */}
            {caregiver.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    About {displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {caregiver.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Specialties & Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Care Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Care Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {caregiver.profile.caregiverSpecialties && caregiver.profile.caregiverSpecialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {caregiver.profile.caregiverSpecialties.map((specialty, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Contact Tavara to learn more about {displayName}'s specialties.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Availability */}
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
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weekends</span>
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overnight</span>
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Notice */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Interested in {displayName}?</h4>
                    <p className="text-sm text-muted-foreground">
                      Contact the Tavara team via WhatsApp to learn more about {displayName} 
                      and start the matching process. We'll help coordinate the next steps.
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
