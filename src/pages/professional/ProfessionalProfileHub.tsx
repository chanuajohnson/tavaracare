
import { useState, useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Briefcase, Star, Settings, GraduationCap, Clock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { FadeIn, SlideIn } from "@/components/framer";

// Define profile interface to match expected structure
interface ProfessionalProfile {
  first_name?: string;
  last_name?: string;
  bio?: string;
  years_of_experience?: string;
  certifications?: string[];
  specialties?: string[];
  availability?: string[];
  hourly_rate?: string;
  profile_complete?: boolean;
}

// Define the availability structure
interface Availability {
  monday: { available: boolean; hours: string[] };
  tuesday: { available: boolean; hours: string[] };
  wednesday: { available: boolean; hours: string[] };
  thursday: { available: boolean; hours: string[] };
  friday: { available: boolean; hours: string[] };
  saturday: { available: boolean; hours: string[] };
  sunday: { available: boolean; hours: string[] };
}

const ProfessionalProfileHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile & { availability: Availability }>({
    first_name: "",
    last_name: "",
    bio: "",
    years_of_experience: "",
    specialties: [],
    certifications: [],
    availability: {
      monday: { available: false, hours: [] },
      tuesday: { available: false, hours: [] },
      wednesday: { available: false, hours: [] },
      thursday: { available: false, hours: [] },
      friday: { available: false, hours: [] },
      saturday: { available: false, hours: [] },
      sunday: { available: false, hours: [] },
    },
    hourly_rate: "",
    profile_complete: false
  });

  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Profile",
      path: "/professional/profile",
    }
  ];

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use the 'profiles' table instead of 'caregiver_profiles'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Map database fields to our profile structure
        const formattedProfile = {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
          years_of_experience: data.years_of_experience || "",
          specialties: data.care_services || [], // Map care_services to specialties
          certifications: data.certifications || [],
          hourly_rate: data.hourly_rate || "",
          profile_complete: Boolean(data.first_name && data.last_name),
          availability: processAvailability(data.availability)
        };
        
        setProfile(formattedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to process availability data from database
  const processAvailability = (availabilityData?: string[]): Availability => {
    const defaultAvailability = {
      monday: { available: false, hours: [] },
      tuesday: { available: false, hours: [] },
      wednesday: { available: false, hours: [] },
      thursday: { available: false, hours: [] },
      friday: { available: false, hours: [] },
      saturday: { available: false, hours: [] },
      sunday: { available: false, hours: [] },
    };
    
    if (!availabilityData || !Array.isArray(availabilityData)) {
      return defaultAvailability;
    }
    
    // Simple parsing of availability data
    // In a real implementation, this would be more sophisticated
    const result = {...defaultAvailability};
    
    availabilityData.forEach(day => {
      const lowerDay = day.toLowerCase();
      if (lowerDay.includes('monday')) result.monday.available = true;
      if (lowerDay.includes('tuesday')) result.tuesday.available = true;
      if (lowerDay.includes('wednesday')) result.wednesday.available = true;
      if (lowerDay.includes('thursday')) result.thursday.available = true;
      if (lowerDay.includes('friday')) result.friday.available = true;
      if (lowerDay.includes('saturday')) result.saturday.available = true;
      if (lowerDay.includes('sunday')) result.sunday.available = true;
    });
    
    return result;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <SlideIn
          direction="up"
          duration={0.5}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Professional Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your professional profile and caregiver information
              </p>
            </div>
          </div>
        </SlideIn>
        
        <Tabs defaultValue="profile" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Experience</span>
              <span className="sm:hidden">Exp</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Availability</span>
              <span className="sm:hidden">Avail</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
              <span className="sm:hidden">Train</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <FadeIn duration={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your personal and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-100 animate-pulse rounded-md" />
                      <div className="h-8 bg-gray-100 animate-pulse rounded-md" />
                      <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">First Name</label>
                          <div className="mt-1 p-2 border rounded-md">
                            {profile.first_name || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Last Name</label>
                          <div className="mt-1 p-2 border rounded-md">
                            {profile.last_name || "Not provided"}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        <div className="mt-1 p-2 border rounded-md min-h-[100px]">
                          {profile.bio || "No bio provided"}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Update Profile</Button>
                </CardFooter>
              </Card>
            </FadeIn>
          </TabsContent>
          
          <TabsContent value="experience">
            <FadeIn duration={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Experience & Specialties</CardTitle>
                  <CardDescription>
                    Showcase your caregiving experience and specialties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-100 animate-pulse rounded-md" />
                      <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                      <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Years of Experience</label>
                        <div className="mt-1 p-2 border rounded-md">
                          {profile.years_of_experience || "Not provided"}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Specialties</label>
                        <div className="mt-1 p-2 border rounded-md min-h-[60px]">
                          {profile.specialties && profile.specialties.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profile.specialties.map((specialty, index) => (
                                <span key={index} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "No specialties listed"
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Certifications</label>
                        <div className="mt-1 p-2 border rounded-md min-h-[60px]">
                          {profile.certifications && profile.certifications.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profile.certifications.map((cert, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "No certifications listed"
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Update Experience</Button>
                </CardFooter>
              </Card>
            </FadeIn>
          </TabsContent>
          
          <TabsContent value="availability">
            <FadeIn duration={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Availability & Rates</CardTitle>
                  <CardDescription>
                    Set your working hours and hourly rate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="h-40 bg-gray-100 animate-pulse rounded-md" />
                      <div className="h-8 bg-gray-100 animate-pulse rounded-md" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Weekly Availability</label>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {Object.entries(profile.availability || {}).map(([day, data]) => (
                                <tr key={day}>
                                  <td className="px-4 py-2 whitespace-nowrap capitalize">{day}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    {data.available ? (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                        Unavailable
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    {data.available && data.hours && data.hours.length > 0 ? (
                                      data.hours.join(", ")
                                    ) : (
                                      <span className="text-gray-500 text-sm">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Hourly Rate (TTD)</label>
                        <div className="mt-1 p-2 border rounded-md">
                          {profile.hourly_rate ? `$${profile.hourly_rate}` : "Not provided"}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Update Availability</Button>
                </CardFooter>
              </Card>
            </FadeIn>
          </TabsContent>
          
          <TabsContent value="training">
            <FadeIn duration={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Training & Certifications</CardTitle>
                  <CardDescription>
                    View and manage your training progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-800">Training Resources Available</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Access our comprehensive caregiver training program to enhance your skills and increase your earning potential.
                        </p>
                        <Button className="mt-3" variant="outline">
                          View Training Resources
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium">Your Certifications</h3>
                    </div>
                    <div className="p-4">
                      {profile.certifications && profile.certifications.length > 0 ? (
                        <div className="space-y-3">
                          {profile.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No certifications added yet</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Add Certification
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalProfileHub;
