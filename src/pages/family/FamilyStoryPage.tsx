import React, { useState, useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Heart, PenLine, ImageIcon, Clock, ArrowRight, BookText } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { FadeIn, SlideIn } from "@/components/framer";

// Type definition for our form data
interface StoryFormData {
  name: string;
  nickname?: string;
  birthplace?: string;
  occupation?: string;
  hobbies?: string;
  music?: string;
  foods?: string;
  family?: string;
  achievements?: string;
  routines?: string;
  communication?: string;
  photos: string[];
}

// Type definition for database care recipient profile
interface CareRecipientProfile {
  id: string;
  user_id: string;
  full_name: string;
  birth_year: string;
  career_fields: string[];
  hobbies_interests: string[];
  personality_traits: string[];
  challenges: string[];
  daily_routines: string;
  communication_preferences?: string;
  cultural_preferences?: string;
  family_social_info?: string;
  joyful_things?: string;
  life_story?: string;
  notable_events?: string;
  sensitivities?: string;
  specific_requests?: string;
  unique_facts?: string;
  caregiver_personality?: string[];
  created_at?: string;
  last_updated?: string;
}

const FamilyStoryPage = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<StoryFormData>({
    name: '',
    nickname: '',
    birthplace: '',
    occupation: '',
    hobbies: '',
    music: '',
    foods: '',
    family: '',
    achievements: '',
    routines: '',
    communication: '',
    photos: []
  });
  
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard/family",
    },
    {
      label: "Care Recipient",
      path: "/family/care-recipient",
    },
    {
      label: isNew ? "Create Story" : "Edit Story",
      path: isNew ? "/family/story/new" : `/family/story/${id}`,
    },
  ];
  
  useEffect(() => {
    if (!isNew && id) {
      loadStoryData();
    }
  }, [id]);
  
  const loadStoryData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('care_recipient_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Map from database fields to our form fields
        const profile = data as CareRecipientProfile;
        setFormData({
          name: profile.full_name || '',
          nickname: profile.unique_facts || '',
          birthplace: profile.birth_year || '', // Using birth_year as birthplace
          occupation: profile.career_fields?.join(', ') || '',
          hobbies: profile.hobbies_interests?.join(', ') || '',
          music: profile.joyful_things || '',
          foods: profile.cultural_preferences || '',
          family: profile.family_social_info || '',
          achievements: profile.notable_events || '',
          routines: profile.daily_routines || '',
          communication: profile.communication_preferences || '',
          photos: [] // Photos are not currently in the schema
        });
      }
    } catch (error) {
      console.error('Error loading story data:', error);
      toast.error('Failed to load story data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save a story');
      return;
    }
    
    setIsSaving(true);
    try {
      // Map form fields to database fields
      const storyData = {
        user_id: user.id,
        full_name: formData.name,
        birth_year: formData.birthplace, // Using birthplace as birth_year
        career_fields: formData.occupation ? [formData.occupation] : [],
        hobbies_interests: formData.hobbies ? [formData.hobbies] : [],
        joyful_things: formData.music,
        cultural_preferences: formData.foods,
        family_social_info: formData.family,
        notable_events: formData.achievements,
        daily_routines: formData.routines,
        communication_preferences: formData.communication,
        unique_facts: formData.nickname,
        // Legacy field mappings (not directly mapped)
        personality_traits: [],
        challenges: [],
      };
      
      let result;
      
      if (isNew) {
        result = await supabase
          .from('care_recipient_profiles')
          .insert([storyData])
          .select();
      } else {
        result = await supabase
          .from('care_recipient_profiles')
          .update(storyData)
          .eq('id', id)
          .select();
      }
      
      if (result.error) throw result.error;
      
      // Update onboarding progress
      if (isNew && user) {
        const { error: progressError } = await supabase
          .from('profiles')
          .update({
            onboarding_progress: {
              completedSteps: {
                care_recipient_story: true
              }
            }
          })
          .eq('id', user.id);
        
        if (progressError) {
          console.error('Error updating onboarding progress:', progressError);
        }
      }
      
      toast.success(isNew ? 'Story created successfully!' : 'Story updated successfully!');
      
      if (isNew && result.data && result.data[0]) {
        navigate(`/family/story/${result.data[0].id}`);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };
  
  const togglePreview = () => {
    setIsPreview(!isPreview);
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
              <h1 className="text-3xl font-bold">{isNew ? "Create Loved One's Legacy Story" : "Edit Legacy Story"}</h1>
              <p className="text-muted-foreground mt-1">
                {isNew 
                  ? "Create a legacy story to help caregivers connect with your loved one."
                  : "Edit your loved one's legacy story to keep information up-to-date."}
              </p>
            </div>
            
            {!isNew && !isPreview && (
              <Button variant="outline" onClick={togglePreview}>
                <BookText className="h-4 w-4 mr-2" />
                Preview Story
              </Button>
            )}
            
            {!isNew && isPreview && (
              <Button variant="outline" onClick={togglePreview}>
                <PenLine className="h-4 w-4 mr-2" />
                Back to Edit
              </Button>
            )}
          </div>
        </SlideIn>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isPreview ? (
          <FadeIn duration={0.5}>
            <Card className="mb-8">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{formData.name}</CardTitle>
                    {formData.nickname && (
                      <CardDescription>Known as: {formData.nickname}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {formData.birthplace && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Birthplace</h3>
                        <p className="text-gray-700">{formData.birthplace}</p>
                      </div>
                    )}
                    
                    {formData.occupation && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Career & Occupation</h3>
                        <p className="text-gray-700">{formData.occupation}</p>
                      </div>
                    )}
                    
                    {formData.hobbies && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Hobbies & Interests</h3>
                        <p className="text-gray-700">{formData.hobbies}</p>
                      </div>
                    )}
                    
                    {formData.music && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Favorite Music</h3>
                        <p className="text-gray-700">{formData.music}</p>
                      </div>
                    )}
                    
                    {formData.foods && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Favorite Foods</h3>
                        <p className="text-gray-700">{formData.foods}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {formData.family && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Family</h3>
                        <p className="text-gray-700">{formData.family}</p>
                      </div>
                    )}
                    
                    {formData.achievements && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Achievements & Proud Moments</h3>
                        <p className="text-gray-700">{formData.achievements}</p>
                      </div>
                    )}
                    
                    {formData.routines && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Daily Routines & Preferences</h3>
                        <p className="text-gray-700">{formData.routines}</p>
                      </div>
                    )}
                    
                    {formData.communication && (
                      <div>
                        <h3 className="font-medium text-lg mb-2">Communication Style</h3>
                        <p className="text-gray-700">{formData.communication}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-medium text-lg mb-4">Photos & Memories</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <FadeIn duration={0.5}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic information about your loved one that helps caregivers connect with them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="nickname" className="block text-sm font-medium mb-1">
                        Nickname or Preferred Name
                      </label>
                      <input
                        id="nickname"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="What they like to be called"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="birthplace" className="block text-sm font-medium mb-1">
                        Birthplace
                      </label>
                      <input
                        id="birthplace"
                        name="birthplace"
                        value={formData.birthplace}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        placeholder="Where they were born"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="occupation" className="block text-sm font-medium mb-1">
                        Career & Occupation
                      </label>
                      <textarea
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="What work did they do in their life?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="family" className="block text-sm font-medium mb-1">
                        Family
                      </label>
                      <textarea
                        id="family"
                        name="family"
                        value={formData.family}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="Important family members, relationships, etc."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Preferences & Interests</CardTitle>
                <CardDescription>
                  Information about what your loved one enjoys and values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="hobbies" className="block text-sm font-medium mb-1">
                      Hobbies & Interests
                    </label>
                    <textarea
                      id="hobbies"
                      name="hobbies"
                      value={formData.hobbies}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      placeholder="What activities do they enjoy?"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="music" className="block text-sm font-medium mb-1">
                        Favorite Music
                      </label>
                      <textarea
                        id="music"
                        name="music"
                        value={formData.music}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={2}
                        placeholder="Songs, artists, or genres they enjoy"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="foods" className="block text-sm font-medium mb-1">
                        Favorite Foods
                      </label>
                      <textarea
                        id="foods"
                        name="foods"
                        value={formData.foods}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={2}
                        placeholder="Foods and drinks they enjoy"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Life Story & Care Information</CardTitle>
                <CardDescription>
                  Details that help caregivers understand your loved one's history and needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="achievements" className="block text-sm font-medium mb-1">
                      Achievements & Proud Moments
                    </label>
                    <textarea
                      id="achievements"
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      placeholder="What accomplishments or memories are they proud of?"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="routines" className="block text-sm font-medium mb-1">
                        Daily Routines & Preferences
                      </label>
                      <textarea
                        id="routines"
                        name="routines"
                        value={formData.routines}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={2}
                        placeholder="Important routines or preferences"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="communication" className="block text-sm font-medium mb-1">
                        Communication Style
                      </label>
                      <textarea
                        id="communication"
                        name="communication"
                        value={formData.communication}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        rows={2}
                        placeholder="How they prefer to communicate, special considerations"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Photos & Memories</CardTitle>
                <CardDescription>
                  Upload photos that help tell your loved one's story.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Photo upload feature coming soon
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    You'll be able to upload and manage photos here
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving && (
                  <Clock className="h-4 w-4 animate-spin" />
                )}
                {isNew ? 'Create Story' : 'Save Changes'}
              </Button>
            </div>
          </FadeIn>
        )}
        
        {!isNew && !isPreview && (
          <div className="mt-12 mb-8">
            <Separator className="my-8" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Preview Your Story</h3>
                <p className="text-sm text-gray-500">
                  See how caregivers will view your loved one's story
                </p>
              </div>
              <Button onClick={togglePreview} className="gap-2">
                Preview Story
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyStoryPage;
