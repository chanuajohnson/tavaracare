import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, Heart, Users, Shield, CheckCircle2, Sparkles } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { MatchingTracker } from "@/components/tracking/MatchingTracker";

const FamilyMatchingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMagicalMessage, setShowMagicalMessage] = useState(true);

  useEffect(() => {
    // Show the magical loading for 3 seconds, then show the caregiver
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Hide the magical message after 2 seconds but keep loading
    const messageTimer = setTimeout(() => {
      setShowMagicalMessage(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(messageTimer);
    };
  }, []);

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Caregiver Matching", path: "/family/matching" },
  ];

  const teaserCaregiver = {
    id: "teaser-1",
    name: "Sarah M.",
    title: "Senior Care Specialist",
    rating: 4.9,
    location: "Port of Spain",
    experience: "8+ years",
    hourlyRate: "$25-35",
    skills: ["Dementia Care", "Medication Management", "Mobility Support", "Meal Preparation"],
    bio: "Passionate about providing compassionate care with specialized training in dementia and Alzheimer's support.",
    availability: "Monday - Friday, 8am - 6pm",
    languages: ["English", "Spanish"],
    certifications: ["CNA", "CPR Certified", "First Aid"],
    matchPercentage: 95
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-8"
          >
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold">Finding Your Perfect Match</h1>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Magical loading circle with sparkles */}
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-500 animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-purple-500 animate-pulse delay-150" />
                  <Sparkles className="absolute top-1/2 -left-4 h-3 w-3 text-pink-500 animate-pulse delay-300" />
                </div>
                
                {showMagicalMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-2"
                  >
                    <p className="text-xl font-semibold text-blue-600">
                      Hold on, we are finding your perfect match! ✨
                    </p>
                    <p className="text-muted-foreground">
                      Analyzing your care needs and preferences...
                    </p>
                  </motion.div>
                )}
                
                {!showMagicalMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-2"
                  >
                    <p className="text-lg text-muted-foreground">
                      Reviewing caregiver profiles and availability...
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MatchingTracker matchingType="family" />
      
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mt-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Your Caregiver Matches</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've found carefully screened caregivers based on your specific care needs and preferences.
            </p>
          </div>

          {/* Premium Feature Notice */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Premium Matching Service</h3>
              </div>
              <p className="text-blue-800 mb-4">
                You're viewing a sample match. Unlock our full caregiver network with verified professionals, 
                background checks, and personalized matching based on your exact requirements.
              </p>
              <SubscriptionFeatureLink
                featureType="Full Caregiver Access"
                returnPath="/family/matching"
                referringPagePath="/family/matching"
                referringPageLabel="Caregiver Matching"
              >
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Unlock All Matches
                </Button>
              </SubscriptionFeatureLink>
            </CardContent>
          </Card>

          {/* Sample Caregiver Match */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{teaserCaregiver.name}</CardTitle>
                  <CardDescription className="text-base">{teaserCaregiver.title}</CardDescription>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {teaserCaregiver.matchPercentage}% Match
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{teaserCaregiver.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{teaserCaregiver.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{teaserCaregiver.experience}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{teaserCaregiver.hourlyRate}/hour</span>
                </div>
              </div>

              <Separator />

              {/* Bio */}
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-muted-foreground">{teaserCaregiver.bio}</p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-medium mb-3">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {teaserCaregiver.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="border-blue-200 text-blue-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-medium mb-3">Certifications & Languages</h4>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {teaserCaregiver.certifications.map((cert) => (
                      <Badge key={cert} className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Languages:</span>
                    <span>{teaserCaregiver.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-medium mb-2">Availability</h4>
                <p className="text-muted-foreground">{teaserCaregiver.availability}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <SubscriptionFeatureLink
                  featureType="Contact Caregiver"
                  returnPath="/family/matching"
                  referringPagePath="/family/matching"
                  referringPageLabel="Caregiver Matching"
                  className="flex-1"
                >
                  <Button className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Contact Caregiver
                  </Button>
                </SubscriptionFeatureLink>
                
                <SubscriptionFeatureLink
                  featureType="View Full Profile"
                  returnPath="/family/matching"
                  referringPagePath="/family/matching"
                  referringPageLabel="Caregiver Matching"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </SubscriptionFeatureLink>
              </div>
            </CardContent>
          </Card>

          {/* Why Only One Match Notice */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Why am I seeing only one match?</h4>
                  <p className="text-sm text-amber-800">
                    This is a preview of our matching capabilities. Premium members get access to our full network 
                    of verified caregivers, advanced filtering options, and unlimited matches based on your specific needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyMatchingPage;
