import { motion } from "framer-motion";
import { Heart, Users, MapPin, Clock, ArrowLeft, AlertCircle, MessageCircle, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UrgentBadge } from "@/components/spotlight/UrgentBadge";

interface UrgentFamily {
  id: string;
  full_name: string;
  location: string | null;
  care_types: string[] | null;
  care_urgency: string | null;
  care_schedule: string | null;
  diagnosed_conditions: string | null;
  chronic_illness_type: string | null;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return "F";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "F";
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getGeneralArea = (location: string | null): string => {
  if (!location) return "Trinidad & Tobago";
  const parts = location.split(',').map(p => p.trim());
  return parts.length > 2 ? parts.slice(-2).join(', ') : location;
};

const useUrgentFamilies = () => {
  return useQuery<UrgentFamily[]>({
    queryKey: ["urgent-families"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_public_family_profiles");

      if (error) throw error;
      return (data as UrgentFamily[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

const CARE_TYPE_LABELS: Record<string, string> = {
  personal_care: "🧼 Personal Care",
  medication_management: "💊 Medication",
  mobility_assistance: "🚶 Mobility",
  meal_preparation: "🍲 Meals",
  housekeeping: "🧹 Housekeeping",
  transportation: "🚗 Transportation",
  companionship: "👥 Companionship",
  specialized_care: "🏥 Specialized",
};

const SCHEDULE_LABELS: Record<string, string> = {
  mornings: "Morning Care",
  afternoons: "Afternoon Care",
  evenings: "Evening Care",
  overnight: "Overnight Care",
  full_time: "Full-time Care",
  flexible: "Flexible Schedule",
  mon_fri_8am_4pm: "Weekdays 8AM–4PM",
  mon_fri_8am_6pm: "Weekdays 8AM–6PM",
  mon_fri_6am_6pm: "Weekdays 6AM–6PM",
  sat_sun_6am_6pm: "Weekends 6AM–6PM",
  sat_sun_8am_4pm: "Weekends 8AM–4PM",
  live_in_care: "Live-In Care",
  "24_7_care": "24/7 Care",
};

const getScheduleLabel = (schedule: string | null): string | null => {
  if (!schedule) return null;
  const parts = schedule.split(',').map(s => s.trim());
  const labels = parts
    .map(p => SCHEDULE_LABELS[p] || p)
    .slice(0, 2);
  if (labels.length === 0) return null;
  return labels.join(' · ') + (parts.length > 2 ? ` +${parts.length - 2}` : '');
};

const UrgentFamiliesPage = () => {
  const navigate = useNavigate();
  const { data: families, isLoading } = useUrgentFamilies();

  const handleWhatsAppInquiry = (family: UrgentFamily) => {
    const BUSINESS_WHATSAPP = "8687865357";
    const area = getGeneralArea(family.location);
    const careTypes = family.care_types?.map(t => CARE_TYPE_LABELS[t] || t).join(", ") || "general care";
    
    const message = encodeURIComponent(
      `Hi Tavara! I'm a caregiver interested in helping the family in ${area} who needs: ${careTypes}. Please let me know the next steps.`
    );
    
    const url = `https://api.whatsapp.com/send/?phone=${BUSINESS_WHATSAPP}&text=${message}&type=phone_number&app_absent=0`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="urgent_families_page_view"
        journeyStage="discovery"
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-destructive/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <AlertCircle className="h-4 w-4" />
              Families Needing Care Now
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Families Available <span className="text-primary">Now</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              These families urgently need compassionate caregivers. If you have the skills 
              and availability, you can make a real difference in someone's life today.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Real Families</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Urgent Need</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Matched to You</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Families Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Families Seeking Caregivers
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : families && families.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family, index) => {
                const initials = getInitials(family.full_name);
                const area = getGeneralArea(family.location);
                const scheduleLabel = getScheduleLabel(family.care_schedule);
                const urgencyLevel = family.care_urgency === "immediate" ? "high" as const : "medium" as const;

                return (
                  <motion.div
                    key={family.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-border/50 bg-card hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-0">
                        {/* Gradient header */}
                        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 pb-12">
                          <div className="flex justify-between items-start">
                            <UrgentBadge
                              urgencyLevel={urgencyLevel}
                              label={family.care_urgency === "immediate" ? "Immediate Need" : "Seeking Care"}
                            />
                          </div>
                        </div>

                        {/* Avatar overlapping header */}
                        <div className="relative px-6 -mt-8">
                          <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Content */}
                        <div className="p-6 pt-3 space-y-4">
                          {/* Title */}
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">Family in {area}</h3>
                            <p className="text-sm text-muted-foreground">Seeking compassionate care</p>
                          </div>

                          {/* Location & Schedule */}
                          <div className="space-y-1.5">
                            {family.location && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {area}
                              </div>
                            )}
                            {scheduleLabel && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {scheduleLabel}
                              </div>
                            )}
                          </div>

                          {/* Care Types */}
                          {family.care_types && family.care_types.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {family.care_types.slice(0, 4).map((type) => (
                                <Badge key={type} variant="secondary" className="text-xs font-normal">
                                  {CARE_TYPE_LABELS[type] || type}
                                </Badge>
                              ))}
                              {family.care_types.length > 4 && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  +{family.care_types.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Status badges */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                              Seeking care now
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Award className="h-3.5 w-3.5 text-primary" />
                              Verified Family
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleWhatsAppInquiry(family)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleWhatsAppInquiry(family)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1.5" />
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Urgent Requests Right Now
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                All families are currently matched or don't have urgent needs. 
                Check back soon or register to be matched automatically.
              </p>
              <Button className="mt-6" onClick={() => navigate("/join-as-caregiver")}>
                Join as Caregiver
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Help a Family in Need?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join Tavara's care community and get matched with families who need your skills. 
              Registration is free and takes just minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/join-as-caregiver")}>
                Join as Caregiver
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/urgent-caregivers")}>
                View Available Caregivers
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UrgentFamiliesPage;
