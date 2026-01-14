import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, Check, X, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserRole } from '@/types/database';
import { updateUserProfile } from '@/lib/profile-utils';

// Constants
const COMMUNITY_ROLES = [
  { id: 'volunteer', label: '🤝 Community Volunteer' },
  { id: 'organizer', label: '📋 Community Organizer' },
  { id: 'advocate', label: '🔊 Patient/Caregiver Advocate' },
  { id: 'educator', label: '🎓 Educator/Trainer' },
  { id: 'support_group', label: '👥 Support Group Leader' },
  { id: 'resource_provider', label: '📚 Resource Provider' },
  { id: 'tech_innovator', label: '💻 Technology Innovator' },
  { id: 'researcher', label: '🔬 Researcher' }
];

const CONTRIBUTION_INTERESTS = [
  { id: 'resources', label: '📚 Sharing Resources & Information' },
  { id: 'events', label: '📅 Organizing Community Events' },
  { id: 'support', label: '🤗 Running Support Groups' },
  { id: 'mentoring', label: '👨‍🏫 Mentoring New Caregivers' },
  { id: 'advocacy', label: '📢 Advocacy & Awareness Campaigns' },
  { id: 'fundraising', label: '💰 Fundraising for Caregiver Causes' },
  { id: 'technology', label: '💻 Technology Solutions for Caregiving' },
  { id: 'education', label: '🎓 Educational Programs & Workshops' }
];

const CAREGIVING_AREAS = [
  { id: 'elderly', label: '👵 Elderly Care' },
  { id: 'children', label: '👶 Childcare' },
  { id: 'special_needs', label: '🧩 Special Needs Care' },
  { id: 'disability', label: '♿ Disability Support' },
  { id: 'mental_health', label: '🧠 Mental Health Support' },
  { id: 'chronic_illness', label: '🏥 Chronic Illness Management' },
  { id: 'palliative', label: '🕊️ Palliative/End-of-Life Care' }
];

const TECH_INTERESTS = [
  { id: 'apps', label: '📱 Caregiver Mobile Apps' },
  { id: 'wearables', label: '⌚ Health Wearables & Monitors' },
  { id: 'telehealth', label: '🩺 Telehealth Solutions' },
  { id: 'smart_home', label: '🏠 Smart Home Technology' },
  { id: 'ai', label: '🤖 AI & Machine Learning for Care' },
  { id: 'accessibility', label: '♿ Accessibility Technology' }
];

const INVOLVEMENT_PREFERENCES = [
  { id: 'online', label: '💻 Online/Virtual Participation' },
  { id: 'in_person', label: '🏙️ In-Person Local Events' },
  { id: 'leadership', label: '👑 Leadership Roles' },
  { id: 'background', label: '🕰️ Behind-the-Scenes Support' },
  { id: 'one_time', label: '📅 One-Time Projects' },
  { id: 'ongoing', label: '🔄 Ongoing Commitments' }
];

const COMMUNICATION_CHANNELS = [
  { id: 'email', label: '📧 Email Updates' },
  { id: 'newsletter', label: '📰 Newsletter' },
  { id: 'app', label: '📱 Mobile App Notifications' },
  { id: 'text', label: '📱 Text Messages' },
  { id: 'social', label: '👥 Social Media' },
  { id: 'forum', label: '💬 Community Forum' }
];

export default function CommunityRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const form = useForm({
    defaultValues: {
      fullName: '',
      location: '',
      phoneNumber: '',
      email: '',
      website: '',
      communityRoles: [] as string[],
      contributionInterests: [] as string[],
      caregivingExperience: '',
      caregivingAreas: [] as string[],
      techInterests: [] as string[],
      involvementPreferences: [] as string[],
      communicationChannels: [] as string[],
      communityMotivation: '',
      improvementIdeas: '',
      listInCommunityDirectory: false,
      enableCommunityNotifications: true
    }
  });

  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
      
      form.setValue('email', user.email || '');
      form.setValue('fullName', fullName);
      
      console.log('[CommunityRegistration] Pre-populated form with user data:', {
        email: user.email,
        fullName,
        firstName,
        lastName
      });
    }
  }, [user, form]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          navigate('/auth');
          toast.error("You must be logged in to complete registration");
          return;
        }
        
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setConnectionStatus(error ? false : true);
        
        if (error) {
          console.error("Connection check failed:", error);
          toast.error("Database connection issue detected. Please try again later.");
        }
      } catch (error) {
        console.error("Connection check error:", error);
        setConnectionStatus(false);
        toast.error("Failed to connect to our services. Please check your internet connection.");
      }
    };
    
    checkConnection();
  }, [navigate]);

  useEffect(() => {
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(profilePicture);
    } else {
      setPreviewUrl(null);
    }
  }, [profilePicture]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("Profile picture must be less than 5MB");
        return;
      }
      setProfilePicture(file);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    if (!file || !connectionStatus) {
      console.error("Cannot upload: Missing file or connection issues");
      return null;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      
      const fileExt = file.name.split('.').pop();
      if (!fileExt) {
        throw new Error("Invalid file type");
      }
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Failed to list buckets:", bucketsError);
        throw new Error("Storage system unavailable");
      }
      
      if (!buckets.find(b => b.name === bucket)) {
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: false,
        });
        
        if (createError) {
          console.error("Failed to create bucket:", createError);
          throw new Error("Failed to initialize storage");
        }
      }

      const timeoutId = setTimeout(() => {
        console.error("Upload operation timed out after 30 seconds");
        toast.error("File upload timed out. Try again with a smaller file or better connection.");
      }, 30000);
      
      let uploadError = null;
      let uploadResult = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          setUploadProgress(10 + attempt * 20);
          
          const filePath = `${path}/${Date.now()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
            
          if (error) {
            console.error(`Upload attempt ${attempt + 1} failed:`, error);
            uploadError = error;
            
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
              continue;
            } else {
              throw error;
            }
          }
          
          const { data: publicURLData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
            
          uploadResult = publicURLData.publicUrl;
          uploadError = null;
          break;
        } catch (err) {
          console.error(`Upload attempt ${attempt + 1} exception:`, err);
          uploadError = err as Error;
          
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          }
        }
      }
      
      clearTimeout(timeoutId);
      
      if (uploadError) {
        setUploadError(`Upload failed after multiple attempts: ${uploadError.message}`);
        toast.error("Failed to upload file after multiple attempts");
        return null;
      }
      
      setUploadProgress(100);
      return uploadResult;
    } catch (error: any) {
      console.error("File upload error:", error);
      setUploadError(error.message || "Upload failed");
      toast.error(`Upload error: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!connectionStatus) {
      toast.error("Cannot submit registration: No connection to our services");
      return;
    }
    
    setIsLoading(true);
    let avatarUrl = null;
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("Authentication error: " + (userError?.message || "Not logged in"));
      }
      
      const userId = userData.user.id;
      
      if (profilePicture) {
        toast.info("Uploading profile picture...");
        avatarUrl = await uploadFile(profilePicture, 'avatars', `community/${userId}`);
        
        if (!avatarUrl) {
          toast.error("Failed to upload profile picture, but continuing with registration");
        } else {
          toast.success("Profile picture uploaded successfully");
        }
      }
      
      const profileData = {
        id: userId,
        full_name: data.fullName,
        role: 'community' as UserRole,
        avatar_url: avatarUrl,
        phone_number: data.phoneNumber,
        location: data.location,
        
        website: data.website,
        community_roles: data.communityRoles,
        contribution_interests: data.contributionInterests,
        caregiving_experience: data.caregivingExperience,
        caregiving_areas: data.caregivingAreas,
        tech_interests: data.techInterests,
        involvement_preferences: data.involvementPreferences,
        communication_channels: data.communicationChannels,
        community_motivation: data.communityMotivation,
        improvement_ideas: data.improvementIdeas,
        list_in_community_directory: data.listInCommunityDirectory,
        enable_community_notifications: data.enableCommunityNotifications
      };
      
      // Use SECURITY DEFINER function to bypass RLS and prevent recursion
      const { data: result, error: updateError } = await supabase.rpc('update_user_profile', {
        profile_data: profileData
      });
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          role: 'community',
          full_name: data.fullName 
        }
      });
      
      if (metadataError) {
        console.error("Metadata update error:", metadataError);
        // Continue anyway as profile was updated
      }
      
      toast.success("Registration completed successfully!");
      
      setTimeout(() => {
        navigate('/dashboard/community');
      }, 1500);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      
      localStorage.setItem('community_registration_data', JSON.stringify(form.getValues()));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('community_registration_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
        toast.info("Restored your previous form data");
      } catch (e) {
        console.error("Failed to parse saved form data:", e);
        localStorage.removeItem('community_registration_data');
      }
    }
  }, [form]);

  if (connectionStatus === false) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="w-full">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-700">Connection Error</CardTitle>
            <CardDescription className="text-red-600">
              We're having trouble connecting to our services. Please check your internet connection and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="w-full">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Community Member Registration</CardTitle>
          <CardDescription>
            Join our community network to connect, contribute, and make a difference for caregivers and their families.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Picture</h3>
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                  <div className="relative w-32 h-32 border rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="profile-upload">Upload a photo</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="profile-upload" 
                        type="file" 
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload a profile picture to help others recognize you in the community. Max size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website or Social Media (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your website, LinkedIn, or other social profile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Community Involvement</h3>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="communityRoles"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What roles would you like to take in our community?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {COMMUNITY_ROLES.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="communityRoles"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                    <FormLabel className="font-normal">
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
                    name="contributionInterests"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What types of contributions interest you?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {CONTRIBUTION_INTERESTS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="contributionInterests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                    <FormLabel className="font-normal">
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
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Caregiving Experience</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="caregivingExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your caregiving experience (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your personal or professional experience with caregiving (if any)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps us understand your perspective and how you might contribute
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="caregivingAreas"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Areas of caregiving you're interested in or experienced with</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {CAREGIVING_AREAS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="caregivingAreas"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                    <FormLabel className="font-normal">
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
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Technology & Innovation</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="techInterests"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What caregiving technologies interest you?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {TECH_INTERESTS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="techInterests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                    <FormLabel className="font-normal">
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
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Participation Preferences</h3>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="involvementPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>How would you prefer to be involved?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {INVOLVEMENT_PREFERENCES.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="involvementPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                    <FormLabel className="font-normal">
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
                    name="communicationChannels"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred communication channels</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {COMMUNICATION_CHANNELS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="communicationChannels"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                    <FormLabel className="font-normal">
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
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Motivation & Ideas</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="communityMotivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why are you interested in joining our community?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your motivation for participating in this community"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="improvementIdeas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have ideas for improving caregiving in your community?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share any ideas you have for improving caregiving support systems"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Directory & Notifications</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="listInCommunityDirectory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            List me in the community directory
                          </FormLabel>
                          <FormDescription>
                            Make your profile visible to other community members
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="enableCommunityNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Enable community notifications
                          </FormLabel>
                          <FormDescription>
                            Receive updates about events, opportunities, and community news
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
