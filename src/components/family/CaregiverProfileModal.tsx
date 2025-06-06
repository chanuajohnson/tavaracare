
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Lock, Calendar, DollarSign, UserCheck, CheckSquare } from "lucide-react";
import { ScheduleVisitModal } from "./ScheduleVisitModal";

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
  hourly_rate?: string | null;
  specialized_care?: string[] | null;
  availability?: string[] | null;
  certifications?: string[] | null;
  distance?: number;
}

interface CaregiverProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: Caregiver;
}

export const CaregiverProfileModal = ({ 
  open, 
  onOpenChange, 
  caregiver 
}: CaregiverProfileModalProps) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Auto-trigger scheduling modal when profile is viewed
  const handleModalOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen) {
      // Small delay to let the profile modal render first
      setTimeout(() => {
        setShowScheduleModal(true);
      }, 500);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Caregiver Profile Preview
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              Schedule your visit to unlock full profile details
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info - Clearly Visible */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={caregiver.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary-100 text-primary-800 text-2xl">
                    {caregiver.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-3 text-center">
                  <h3 className="text-xl font-semibold">{caregiver.full_name}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{caregiver.location}</span>
                  </div>
                  {caregiver.distance && (
                    <p className="text-sm text-gray-500">{caregiver.distance.toFixed(1)} km away</p>
                  )}
                </div>
                
                <div className="bg-green-100 w-full rounded-lg p-3 text-center border border-green-200 mt-3">
                  <span className="text-sm text-green-700 font-medium">Match Score</span>
                  <div className="text-3xl font-bold text-green-800">{caregiver.match_score}%</div>
                  <span className="text-xs text-green-600">Excellent Match!</span>
                </div>
              </div>
              
              {/* Basic Details - Visible */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary-600" />
                    <div>
                      <div className="text-sm text-gray-500">Experience</div>
                      <div className="font-medium">{caregiver.years_of_experience}</div>
                    </div>
                  </div>
                  
                  {caregiver.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary-600" />
                      <div>
                        <div className="text-sm text-gray-500">Hourly Rate</div>
                        <div className="font-medium">{caregiver.hourly_rate}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-2">Care Specialties</div>
                  <div className="flex flex-wrap gap-2">
                    {caregiver.care_types?.map((type, i) => (
                      <Badge key={i} variant="outline" className="bg-gray-50">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {caregiver.specialized_care && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Special Care Expertise</div>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.specialized_care.map((specialty, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Locked/Blurred Content */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center p-6">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Schedule Your Visit to Unlock Full Details
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get access to reviews, certifications, detailed bio, and contact information
                  </p>
                  <Button 
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Schedule Visit Now
                  </Button>
                </div>
              </div>
              
              {/* Blurred Content Behind Overlay */}
              <div className="blur-sm space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Reviews & Ratings</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="h-4 w-4 text-amber-500" />
                      ))}
                      <span className="text-sm text-gray-600">5.0 (12 reviews)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm">"Amazing caregiver, very professional and caring..."</p>
                        <p className="text-xs text-gray-500 mt-1">- Sarah M.</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm">"Helped our family tremendously during a difficult time..."</p>
                        <p className="text-xs text-gray-500 mt-1">- John D.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Certifications & Training</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Background Checked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">CPR Certified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">First Aid Trained</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Alzheimer's Care Specialist</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">About Me</h4>
                  <p className="text-sm text-gray-600">
                    I have been providing compassionate care for over 5 years, specializing in elderly care 
                    and companionship. I believe in treating each person with dignity and respect, ensuring 
                    they feel comfortable and safe in their own environment. My approach focuses on...
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Availability Schedule</h4>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center">
                        <div className="font-medium">{day}</div>
                        <div className="bg-green-100 p-1 rounded mt-1">9-5</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Visit Modal */}
      <ScheduleVisitModal 
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        caregiverName={caregiver.full_name}
      />
    </>
  );
};
