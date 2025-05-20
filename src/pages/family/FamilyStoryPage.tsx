
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { BookOpen, Sparkles, Heart, Award, Calendar, Briefcase, Users, Brain, LifeBuoy } from "lucide-react";

const personalityTraits = [
  { id: "meticulous", label: "Meticulous" },
  { id: "creative", label: "Creative" },
  { id: "social", label: "Social" },
  { id: "reserved", label: "Reserved" },
  { id: "independent", label: "Independent" },
  { id: "nurturing", label: "Nurturing" },
  { id: "analytical", label: "Analytical" },
  { id: "adventurous", label: "Adventurous" },
  { id: "traditional", label: "Traditional" },
  { id: "adaptable", label: "Adaptable" },
];

const hobbiesInterests = [
  { id: "reading", label: "Reading" },
  { id: "music", label: "Music" },
  { id: "gardening", label: "Gardening" },
  { id: "puzzles", label: "Puzzles" },
  { id: "technology", label: "Technology" },
  { id: "cooking", label: "Cooking" },
  { id: "arts_crafts", label: "Arts & Crafts" },
  { id: "sports", label: "Sports" },
  { id: "travel", label: "Travel" },
  { id: "movies", label: "Movies & TV" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "collecting", label: "Collecting" },
];

const careerFields = [
  { id: "engineering", label: "Engineering" },
  { id: "education", label: "Education" },
  { id: "medicine", label: "Medicine & Healthcare" },
  { id: "business", label: "Business & Finance" },
  { id: "arts", label: "Arts & Entertainment" },
  { id: "service", label: "Service Industry" },
  { id: "government", label: "Government & Public Service" },
  { id: "science", label: "Science & Research" },
  { id: "trades", label: "Skilled Trades" },
  { id: "technology", label: "Technology" },
  { id: "homemaker", label: "Homemaker" },
];

const caregiverPersonalities = [
  { id: "empathetic", label: "Empathetic & Nurturing" },
  { id: "structured", label: "Structured & Organized" },
  { id: "talkative", label: "Talkative & Engaging" },
  { id: "quiet", label: "Quiet & Calming" },
  { id: "patient", label: "Patient & Attentive" },
  { id: "energetic", label: "Energetic & Motivating" },
  { id: "adaptable", label: "Adaptable & Flexible" },
  { id: "proactive", label: "Proactive Problem Solver" },
];

const challenges = [
  { id: "memory_loss", label: "Memory Loss" },
  { id: "mobility", label: "Mobility Issues" },
  { id: "speech", label: "Speech Difficulties" },
  { id: "vision", label: "Vision Impairment" },
  { id: "hearing", label: "Hearing Impairment" },
  { id: "isolation", label: "Social Isolation" },
  { id: "emotional", label: "Emotional Regulation" },
  { id: "cognitive", label: "Cognitive Processing" },
  { id: "sleep", label: "Sleep Disruption" },
  { id: "eating", label: "Eating/Nutrition Challenges" },
];

// Generate birth year options (1920 to current year - 18)
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: currentYear - 1920 - 18 + 1 }, (_, i) => currentYear - 18 - i);

// Form schema using zod
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  birthYear: z.string(),
  personalityTraits: z.array(z.string()).min(1, { message: "Please select at least one personality trait." }),
  hobbiesInterests: z.array(z.string()),
  notableEvents: z.string(),
  careerFields: z.array(z.string()),
  familySocialInfo: z.string(),
  caregiverPersonality: z.array(z.string()).min(1, { message: "Please select at least one caregiver personality type." }),
  culturalPreferences: z.string(),
  dailyRoutines: z.string(),
  challenges: z.array(z.string()),
  sensitivities: z.string(),
  specificRequests: z.string(),
  lifeStory: z.string().min(10, { message: "Please share a brief story about your loved one." }),
  joyfulThings: z.string(),
  uniqueFacts: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const FamilyStoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Tell Their Story", path: "/family/story" },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      birthYear: "1950",
      personalityTraits: [],
      hobbiesInterests: [],
      notableEvents: "",
      careerFields: [],
      familySocialInfo: "",
      caregiverPersonality: [],
      culturalPreferences: "",
      dailyRoutines: "",
      challenges: [],
      sensitivities: "",
      specificRequests: "",
      lifeStory: "",
      joyfulThings: "",
      uniqueFacts: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit this form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save the data to Supabase
      const { error } = await supabase
        .from('care_recipient_profiles')
        .upsert({
          user_id: user.id,
          full_name: data.fullName,
          birth_year: data.birthYear,
          personality_traits: data.personalityTraits,
          hobbies_interests: data.hobbiesInterests,
          notable_events: data.notableEvents,
          career_fields: data.careerFields,
          family_social_info: data.familySocialInfo,
          caregiver_personality: data.caregiverPersonality,
          cultural_preferences: data.culturalPreferences,
          daily_routines: data.dailyRoutines,
          challenges: data.challenges,
          sensitivities: data.sensitivities,
          specific_requests: data.specificRequests,
          life_story: data.lifeStory,
          joyful_things: data.joyfulThings,
          unique_facts: data.uniqueFacts,
          last_updated: new Date().toISOString(),
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Story saved successfully!");
      navigate("/dashboard/family");
    } catch (error) {
      console.error("Error saving story:", error);
      toast.error("Failed to save story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-8 border border-primary/10">
            <h1 className="text-3xl font-bold text-primary mb-2 flex items-center">
              <BookOpen className="mr-2 h-8 w-8" />
              Tell Their Story
            </h1>
            <p className="text-gray-600 mb-4">
              Share details about your loved one to help us better understand who they are and how to provide the most personalized care possible.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Heart className="h-5 w-5" />, text: "Honor their unique life journey" },
                { icon: <Sparkles className="h-5 w-5" />, text: "Enhance caregiver matching" },
                { icon: <Users className="h-5 w-5" />, text: "Build meaningful connections" },
              ].map((item, index) => (
                <div key={index} className="bg-white px-3 py-1.5 rounded-full text-sm flex items-center shadow-sm">
                  {item.icon}
                  <span className="ml-1.5">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: About Your Loved One */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary">
                    <Users className="mr-2 h-6 w-6" />
                    About Your Loved One
                  </CardTitle>
                  <CardDescription>
                    Help us understand who they are beyond their care needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormDescription>Your loved one's full name</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Birth</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {birthYears.map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Their year of birth</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="personalityTraits"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">Personality Traits</FormLabel>
                          <FormDescription>
                            Select traits that best describe your loved one
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {personalityTraits.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="personalityTraits"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hobbiesInterests"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">Hobbies & Interests</FormLabel>
                          <FormDescription>
                            What activities bring or brought them joy?
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {hobbiesInterests.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="hobbiesInterests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notableEvents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notable Life Events</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Special achievements, significant life events, or memorable experiences..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share any significant moments or experiences that shaped their life
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="careerFields"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">Career & Achievements</FormLabel>
                          <FormDescription>
                            What fields did they work in or what were they known for?
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {careerFields.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="careerFields"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="familySocialInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family & Social Life</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Information about their family, friends, and social connections..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Tell us about their family structure, social connections, and relationships
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lifeStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Their Life Story</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share a brief story that captures who they are..." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Who are they beyond their care needs? What makes them unique?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="joyfulThings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What Brings Them Joy?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Activities, topics, or experiences that bring joy and comfort..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe things that make them smile or feel at ease
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uniqueFacts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Something Only Family Members Know</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Special habits, preferences, or quirks that make them unique..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share unique details that help caregivers connect on a deeper level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Section 2: Expanded Care Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-primary">
                    <LifeBuoy className="mr-2 h-6 w-6" />
                    Care Preferences
                  </CardTitle>
                  <CardDescription>
                    Help us understand their specific care needs and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="caregiverPersonality"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">Ideal Caregiver Personality</FormLabel>
                          <FormDescription>
                            What type of caregiver personality would suit them best?
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {caregiverPersonalities.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="caregiverPersonality"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="culturalPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultural or Language Preferences</FormLabel>
                        <FormControl>
                          <Input placeholder="Any specific cultural considerations or language needs..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Cultural backgrounds, traditions, or language preferences that are important
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyRoutines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Routines & Important Rituals</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Regular routines and rituals that are important to maintain..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe daily habits, schedules, or rituals that provide comfort and structure
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="challenges"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel className="text-base">Challenges They Face</FormLabel>
                          <FormDescription>
                            What specific challenges might require caregiver support?
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {challenges.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="challenges"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sensitivities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical or Sensory Sensitivities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any sensitivities to light, sound, touch, medications..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Note any sensitivities, allergies, or reactions caregivers should be aware of
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specificRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Requests for Matching</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific preferences for caregiver matching..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share any additional preferences or requirements for the ideal caregiver match
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard/family")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "Saving..." : "Save Their Story"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyStoryPage;
