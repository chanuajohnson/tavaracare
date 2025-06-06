
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, MapPin, Star, Clock, Lock, Sparkles, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { GoogleCalendarSchedulingModal } from "@/components/common/GoogleCalendarSchedulingModal";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiverName?: string;
  onVisitScheduled?: () => void;
}

export const ScheduleVisitModal = ({ 
  open, 
  onOpenChange, 
  caregiverName = "your matched caregiver",
  onVisitScheduled
}: ScheduleVisitModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [visitCompleted, setVisitCompleted] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<'virtual' | 'in_person' | null>(null);

  const handleSlowPlanningPath = () => {
    navigate("/subscription/features", {
      state: {
        featureType: "Premium Match Features",
        returnPath: "/family/matching",
        referringPagePath: "/dashboard/family",
        referringPageLabel: "Family Dashboard",
        planType: "slow_planning",
        price: 7.99
      }
    });
    onOpenChange(false);
  };

  const handleScheduleVisit = (visitType: 'virtual' | 'in_person') => {
    if (!user) {
      toast.error("Please log in to schedule a visit");
      return;
    }

    // Store the visit type for the calendar modal
    setSelectedVisitType(visitType);
    
    // Open Google Calendar in new tab
    const calendarUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0zpjFp9GxbxjVNxZttxh9YdswYlq0Wh8_r5FbOHZ5C_ozMGwMd_I7gd9-XJbI3SjhXLRPGfH0B?gv=true";
    window.open(calendarUrl, '_blank');
    
    // Show the contact information modal
    setTimeout(() => {
      setShowCalendarModal(true);
    }, 1000); // Small delay to let user see the calendar opened
  };

  const handleCalendarSuccess = () => {
    setShowCalendarModal(false);
    setVisitCompleted(true);
    toast.success("Visit scheduled successfully!");
    
    // Notify parent component about the successful scheduling
    if (onVisitScheduled) {
      onVisitScheduled();
    }
  };

  const handleTrialDay = () => {
    if (!visitCompleted) {
      toast.error("Please complete your visit first to unlock trial day");
      return;
    }
    
    navigate("/family/trial-day-booking");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">
              Choose Your Path Forward
            </DialogTitle>
            <DialogDescription className="text-lg">
              Ready to connect with {caregiverName}? Pick the option that works best for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Card 1: Slow Planning Path */}
            <Card className="relative border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Unlock Premium Features</CardTitle>
                </div>
                <div className="text-3xl font-bold text-blue-600">$7.99</div>
                <CardDescription>One-time unlock</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    No Rush? Browse & Compare
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span>See all qualified caregivers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span>Advanced filtering options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span>Compare profiles & reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span>Take your time to decide</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleSlowPlanningPath}
                >
                  Browse All Matches
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Perfect for non-urgent care planning
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Schedule Visit - Urgent Care Path */}
            <Card className="relative border-2 border-green-200 hover:border-green-300 transition-colors">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  Ready for Care
                </Badge>
              </div>
              
              <CardHeader className="text-center pt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Schedule Your Visit</CardTitle>
                </div>
                <CardDescription>Meet your care coordinator</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Virtual Visit Option */}
                <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Virtual Visit</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      FREE
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">1-2 hour video call to discuss care needs</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleScheduleVisit('virtual')}
                    disabled={isLoading}
                  >
                    Schedule Virtual Visit
                  </Button>
                </div>
                
                {/* In-Person Visit Option */}
                <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-medium">In-Person Visit</span>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      $300 TTD
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Home assessment with care coordinator</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => handleScheduleVisit('in_person')}
                    disabled={isLoading}
                  >
                    Schedule Home Visit
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  Perfect when you need care soon
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Trial Day */}
            <Card className={`relative border-2 transition-colors ${
              visitCompleted 
                ? 'border-purple-200 hover:border-purple-300' 
                : 'border-gray-200 opacity-60'
            }`}>
              {visitCompleted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Trial Day Experience</CardTitle>
                </div>
                <div className="text-3xl font-bold text-purple-600">$35</div>
                <CardDescription>per hour - 8 hour shift</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Schedule within a week of visit completion
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>8-hour care experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>Meet {caregiverName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>Full service preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span>No long-term commitment</span>
                  </div>
                </div>

                {!visitCompleted && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <div className="text-center p-2">
                        <Lock className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">
                          Unlocks after visit completion
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gray-400 cursor-not-allowed"
                      disabled={true}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Book Trial Day
                    </Button>
                  </div>
                )}

                {visitCompleted && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleTrialDay}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Book Trial Day
                  </Button>
                )}
                
                <p className="text-xs text-gray-500 text-center">
                  {visitCompleted 
                    ? "Experience care with no commitment" 
                    : "Complete your visit to unlock this option"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Questions? Contact us at <span className="text-primary font-medium">support@tavara.care</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Calendar Scheduling Modal */}
      <GoogleCalendarSchedulingModal
        open={showCalendarModal}
        onOpenChange={setShowCalendarModal}
        onSuccess={handleCalendarSuccess}
        visitType={selectedVisitType}
      />
    </>
  );
};
