import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Users, Shield, Clock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SpotlightCaregiverCard } from "@/components/spotlight/SpotlightCaregiverCard";
import { TestimonialCard } from "@/components/spotlight/TestimonialCard";
import { useSpotlightCaregivers, useCaregiverTestimonials } from "@/hooks/useSpotlightData";
import { Skeleton } from "@/components/ui/skeleton";
import { SpotlightCaregiverDetailModal } from "@/components/spotlight/SpotlightCaregiverDetailModal";
import { SpotlightCaregiver } from "@/services/spotlightService";

const UrgentCaregiversPage = () => {
  const navigate = useNavigate();
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaregiverData, setSelectedCaregiverData] = useState<SpotlightCaregiver | null>(null);
  
  const { data: spotlightCaregivers, isLoading: isLoadingSpotlight } = useSpotlightCaregivers();
  const { data: testimonials } = useCaregiverTestimonials(selectedCaregiver || undefined);

  const handleViewDetails = (id: string) => {
    const caregiver = spotlightCaregivers?.find(c => c.caregiverId === id);
    if (caregiver) {
      // Pass the full spotlight caregiver data to the new modal
      setSelectedCaregiverData(caregiver);
      setShowDetailModal(true);
    }
  };

  const handleWhatsAppChat = (id: string) => {
    const caregiver = spotlightCaregivers?.find(c => c.caregiverId === id);
    
    // Route all inquiries to centralized business number
    const BUSINESS_WHATSAPP = "8687865357";
    
    // Include caregiver details so you know who they're asking about
    const caregiverHeadline = caregiver?.headline || "a caregiver";
    const caregiverLocation = caregiver?.profile?.location || caregiver?.profile?.address || "";
    
    const message = encodeURIComponent(
      `Hi Tavara! I'm interested in connecting with the caregiver: "${caregiverHeadline}"${caregiverLocation ? ` from ${caregiverLocation}` : ""}. Please let me know the next steps.`
    );
    
    const url = `https://api.whatsapp.com/send/?phone=${BUSINESS_WHATSAPP}&text=${message}&type=phone_number&app_absent=0`;
    window.open(url, '_blank');
  };

  // Calculate average rating for a caregiver
  const getAverageRating = (caregiverId: string, allTestimonials: any[]) => {
    const caregiverTestimonials = allTestimonials?.filter(t => t.caregiverId === caregiverId) || [];
    if (caregiverTestimonials.length === 0) return undefined;
    const sum = caregiverTestimonials.reduce((acc, t) => acc + (t.rating || 0), 0);
    return sum / caregiverTestimonials.length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
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
              <Clock className="h-4 w-4" />
              Immediate Availability
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Caregivers Ready <span className="text-primary">Now</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect with verified, experienced caregivers who are immediately available. 
              Our featured professionals are ready to provide compassionate care for your loved ones.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Background Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Reference Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Family Approved</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Caregivers Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Featured Caregivers
          </h2>

          {isLoadingSpotlight ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : spotlightCaregivers && spotlightCaregivers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spotlightCaregivers.map((caregiver, index) => (
                <motion.div
                  key={caregiver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <SpotlightCaregiverCard
                    id={caregiver.caregiverId}
                    name={caregiver.profile.fullName}
                    avatarUrl={caregiver.profile.avatarUrl}
                    headline={caregiver.headline}
                    description={caregiver.description}
                    specialties={caregiver.profile.caregiverSpecialties}
                    location={caregiver.profile.location || caregiver.profile.address}
                    urgencyLevel="high"
                    onViewDetails={handleViewDetails}
                    onWhatsAppChat={handleWhatsAppChat}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-xl">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Featured Caregivers Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're currently curating our list of featured caregivers. 
                Check back soon or browse all available professionals.
              </p>
              <Button className="mt-6" onClick={() => navigate("/family/matching")}>
                Browse All Caregivers
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {selectedCaregiver && testimonials && testimonials.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              What Families Say
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <TestimonialCard
                    familyName={testimonial.familyName}
                    relationship={testimonial.familyRelationship}
                    content={testimonial.content}
                    rating={testimonial.rating}
                    carePeriodStart={testimonial.carePeriodStart}
                    carePeriodEnd={testimonial.carePeriodEnd}
                    isVerified={testimonial.isVerified}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Need Help Finding the Right Caregiver?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our care coordination team can help match you with the perfect caregiver 
              based on your specific needs and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/family/matching")}>
                Find Your Match
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/faq")}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Caregiver Detail Modal */}
      <SpotlightCaregiverDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        caregiver={selectedCaregiverData}
        onWhatsAppChat={handleWhatsAppChat}
      />
    </div>
  );
};

export default UrgentCaregiversPage;
