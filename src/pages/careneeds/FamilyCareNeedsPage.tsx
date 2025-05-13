
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FadeIn, SlideIn } from "@/components/framer";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { updateProfileOnboardingProgress } from "@/services/profile/profileUpdates";
import { getUserProfile, updateUserProfile } from "@/lib/profile-utils";
import { UserProfile } from "@/types/profile"; // Import UserProfile type
import { toast } from "sonner";

const FamilyCareNeedsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null); // Explicitly type as UserProfile
  const [selectedNeeds, setSelectedNeeds] = useState<Record<string, boolean>>({});

  // Fetch profile data when component mounts
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      const { data, success } = await getUserProfile(user.id);
      if (success && data) {
        setProfileData(data as UserProfile); // Cast to UserProfile type
        
        // If there are existing care needs, populate the selected needs state
        if (data.care_needs && Array.isArray(data.care_needs)) {
          const needsMap: Record<string, boolean> = {};
          data.care_needs.forEach((need: string) => {
            needsMap[need] = true;
          });
          setSelectedNeeds(needsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Care Needs", path: "/careneeds/family" },
  ];

  const careNeeds = [
    {
      category: "Daily Living Assistance",
      items: [
        "Personal hygiene/bathing",
        "Dressing assistance",
        "Meal preparation",
        "Feeding assistance",
        "Toileting assistance",
        "Mobility assistance"
      ]
    },
    {
      category: "Healthcare Support",
      items: [
        "Medication management",
        "Wound care",
        "Vital signs monitoring",
        "Medical equipment assistance",
        "Therapy support",
        "Doctor's appointments"
      ]
    },
    {
      category: "Specialized Care",
      items: [
        "Dementia/Alzheimer's care",
        "Post-surgery recovery",
        "Disability support",
        "Terminal illness care",
        "Palliative care",
        "Mental health support"
      ]
    },
    {
      category: "Household Support",
      items: [
        "Light housekeeping",
        "Laundry assistance",
        "Grocery shopping",
        "Meal planning",
        "Home organization",
        "Pet care assistance"
      ]
    },
    {
      category: "Social & Lifestyle",
      items: [
        "Companionship",
        "Transportation",
        "Social activities",
        "Exercise/physical activity",
        "Cognitive stimulation",
        "Religious/cultural activities"
      ]
    }
  ];

  const toggleNeed = (need: string) => {
    setSelectedNeeds(prev => ({
      ...prev,
      [need]: !prev[need]
    }));
  };

  const getSelectedNeedsArray = () => {
    return Object.entries(selectedNeeds)
      .filter(([_, isSelected]) => isSelected)
      .map(([need]) => need);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to save care needs");
      return;
    }

    setLoading(true);
    try {
      const selectedNeedsArray = getSelectedNeedsArray();
      
      // Update profile with selected care needs
      await updateProfileOnboardingProgress(user.id, 'care_needs', true);
      
      // Update the profile data with the selected care needs
      const updateResult = await updateUserProfile(user.id, {
        care_needs: selectedNeedsArray,
        onboarding_progress: {
          ...(profileData?.onboarding_progress || {}),
          completedSteps: {
            ...(profileData?.onboarding_progress?.completedSteps || {}),
            care_needs: true
          }
        }
      });

      if (updateResult.success) {
        // Update local state
        setProfileData({
          ...profileData!,
          care_needs: selectedNeedsArray,
          onboarding_progress: {
            ...(profileData?.onboarding_progress || {}),
            completedSteps: {
              ...(profileData?.onboarding_progress?.completedSteps || {}),
              care_needs: true
            }
          }
        });

        toast.success("Care needs updated successfully");
        navigate("/dashboard/family");
      } else {
        throw new Error(updateResult.error || "Unknown error updating profile");
      }
    } catch (error) {
      console.error("Error updating care needs:", error);
      toast.error("Failed to update care needs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedNeeds).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <FadeIn duration={0.5} className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Care Needs Assessment</h1>
            <p className="mt-2 text-gray-600">
              Select all care needs that apply to help us match you with the right care providers
            </p>
          </div>

          <div className="space-y-8">
            {careNeeds.map((categoryGroup, groupIndex) => (
              <SlideIn 
                key={categoryGroup.category} 
                direction="up" 
                delay={groupIndex * 0.1} 
                duration={0.5}
              >
                <Card className="overflow-hidden shadow-sm">
                  <div className="bg-primary/5 px-6 py-4 border-b">
                    <h2 className="text-lg font-medium text-primary-800">
                      {categoryGroup.category}
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryGroup.items.map((need) => (
                        <div key={need} className="flex items-start space-x-3">
                          <Checkbox
                            id={`need-${need}`}
                            checked={selectedNeeds[need] || false}
                            onCheckedChange={() => toggleNeed(need)}
                            className="mt-1"
                          />
                          <label
                            htmlFor={`need-${need}`}
                            className="text-sm text-gray-700 font-medium cursor-pointer"
                          >
                            {need}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </SlideIn>
            ))}
            
            <FadeIn delay={0.5} duration={0.5} className="pt-6 flex flex-col items-center">
              <p className="mb-4 text-sm text-gray-600">
                {getSelectedCount()} needs selected
              </p>
              <Button
                onClick={handleSubmit}
                disabled={loading || getSelectedCount() === 0}
                className="min-w-[200px]"
              >
                {loading ? "Saving..." : "Save Care Needs"}
              </Button>
              {getSelectedCount() === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  Please select at least one care need
                </p>
              )}
            </FadeIn>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default FamilyCareNeedsPage;
