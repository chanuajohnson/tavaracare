
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LegacyStoriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [storyData, setStoryData] = useState(null);
  
  // Fetch existing story data if available
  useEffect(() => {
    const fetchStoryData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('care_recipient_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setStoryData(data);
        }
      } catch (error) {
        console.error("Error fetching legacy story:", error);
        toast.error("Failed to load legacy story data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoryData();
  }, [user]);
  
  const [formData, setFormData] = useState({
    full_name: "",
    birth_year: "",
    personality_traits: [],
    hobbies_interests: [],
    career_fields: [],
    challenges: [],
    life_story: "",
    notable_events: "",
    unique_facts: "",
    caregiver_personality: []
  });
  
  // Update form data when story data is loaded
  useEffect(() => {
    if (storyData) {
      setFormData({
        full_name: storyData.full_name || "",
        birth_year: storyData.birth_year || "",
        personality_traits: storyData.personality_traits || [],
        hobbies_interests: storyData.hobbies_interests || [],
        career_fields: storyData.career_fields || [],
        challenges: storyData.challenges || [],
        life_story: storyData.life_story || "",
        notable_events: storyData.notable_events || "",
        unique_facts: storyData.unique_facts || "",
        caregiver_personality: storyData.caregiver_personality || []
      });
    }
  }, [storyData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    // Convert comma-separated string to array
    const arrayValue = value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save a legacy story");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const payload = {
        ...formData,
        user_id: user.id
      };
      
      let result;
      
      if (storyData?.id) {
        // Update existing story
        const { data, error } = await supabase
          .from('care_recipient_profiles')
          .update(payload)
          .eq('id', storyData.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        toast.success("Legacy story updated successfully");
      } else {
        // Create new story
        const { data, error } = await supabase
          .from('care_recipient_profiles')
          .insert(payload)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        toast.success("Legacy story created successfully");
      }
      
      setStoryData(result);
      
      // Navigate back to dashboard after success
      navigate('/dashboard/family');
      
    } catch (error) {
      console.error("Error saving legacy story:", error);
      toast.error("Failed to save legacy story");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !storyData) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {storyData ? "Edit" : "Create"} Your Loved One's Legacy Story
          </h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Legacy Story Details</CardTitle>
              <CardDescription>
                Sharing your loved one's story helps caregivers provide more personalized and meaningful care
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="personality">Personality & Interests</TabsTrigger>
                    <TabsTrigger value="life-story">Life Story</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birth_year">Birth Year</Label>
                      <Input 
                        id="birth_year"
                        name="birth_year"
                        value={formData.birth_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 1945"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="career_fields">Career Fields (comma separated)</Label>
                      <Input 
                        id="career_fields"
                        name="career_fields"
                        value={formData.career_fields.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="e.g., Teaching, Healthcare, Business"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="challenges">Challenges Faced (comma separated)</Label>
                      <Input 
                        id="challenges"
                        name="challenges"
                        value={formData.challenges.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="e.g., Arthritis, Memory loss, Mobility issues"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="personality" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="personality_traits">Personality Traits (comma separated)</Label>
                      <Input 
                        id="personality_traits"
                        name="personality_traits"
                        value={formData.personality_traits.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="e.g., Kind, Patient, Humorous"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hobbies_interests">Hobbies & Interests (comma separated)</Label>
                      <Input 
                        id="hobbies_interests"
                        name="hobbies_interests"
                        value={formData.hobbies_interests.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="e.g., Gardening, Reading, Music"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="caregiver_personality">Preferred Caregiver Personality (comma separated)</Label>
                      <Input 
                        id="caregiver_personality"
                        name="caregiver_personality"
                        value={formData.caregiver_personality.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="e.g., Patient, Attentive, Cheerful"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="life-story" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="life_story">Life Story</Label>
                      <Textarea 
                        id="life_story"
                        name="life_story"
                        value={formData.life_story}
                        onChange={handleInputChange}
                        placeholder="Share your loved one's life journey..."
                        rows={6}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notable_events">Notable Life Events</Label>
                      <Textarea 
                        id="notable_events"
                        name="notable_events"
                        value={formData.notable_events}
                        onChange={handleInputChange}
                        placeholder="Important events that shaped their life..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unique_facts">Unique Facts & Preferences</Label>
                      <Textarea 
                        id="unique_facts"
                        name="unique_facts"
                        value={formData.unique_facts}
                        onChange={handleInputChange}
                        placeholder="Special preferences, routines, or little-known facts..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/family')}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : (storyData ? "Update" : "Save")} Legacy Story
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default LegacyStoriesPage;
