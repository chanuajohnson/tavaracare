import { motion } from "framer-motion";
import { Heart, Users, MapPin, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface UrgentFamily {
  id: string;
  full_name: string;
  location: string | null;
  care_types: string[] | null;
  care_urgency: string | null;
  care_recipient_name: string | null;
  care_schedule: string | null;
}

const getFirstNameLastInitial = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
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
        .from("profiles")
        .select("id, full_name, location, care_types, care_urgency, care_recipient_name, care_schedule")
        .eq("role", "family")
        .eq("available_for_matching", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
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

const UrgentFamiliesPage = () => {
  const navigate = useNavigate();
  const { data: families, isLoading } = useUrgentFamilies();

  const handleWhatsAppInquiry = (family: UrgentFamily) => {
    const BUSINESS_WHATSAPP = "8687865357";
    const location = family.location || family.address || "unknown area";
    const careTypes = family.care_types?.map(t => CARE_TYPE_LABELS[t] || t).join(", ") || "general care";
    
    const message = encodeURIComponent(
      `Hi Tavara! I'm a caregiver interested in helping the family in ${location} who needs: ${careTypes}. Please let me know the next steps.`
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
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : families && families.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family, index) => (
                <motion.div
                  key={family.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      {/* Urgency Badge */}
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="animate-pulse">
                          {family.care_urgency === "immediate" ? "🔴 Immediate" : "🟡 This Week"}
                        </Badge>
                      </div>

                      {/* Family Info - Privacy-safe */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Family in {family.location || family.address || "Trinidad & Tobago"}
                        </h3>
                        {family.care_recipient_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Care for: {family.care_recipient_name}
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      {(family.location || family.address) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>{family.location || family.address}</span>
                        </div>
                      )}

                      {/* Care Types */}
                      {family.care_types && family.care_types.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {family.care_types.slice(0, 4).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {CARE_TYPE_LABELS[type] || type}
                            </Badge>
                          ))}
                          {family.care_types.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{family.care_types.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <Button 
                        onClick={() => handleWhatsAppInquiry(family)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        💬 Inquire on WhatsApp
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
