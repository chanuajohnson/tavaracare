import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, Check, X, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { updateUserProfile } from '@/lib/profile-utils';

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

// Constants
const RELATIONSHIPS = [
  { id: 'spouse', label: 'Spouse/Partner' },
  { id: 'parent', label: 'Parent' },
  { id: 'child', label: 'Child' },
  { id: 'sibling', label: 'Sibling' },
  { id: 'grandparent', label: 'Grandparent' },
  { id: 'other_relative', label: 'Other Relative' },
  { id: 'friend', label: 'Friend' },
  { id: 'neighbor', label: 'Neighbor' },
  { id: 'colleague', label: 'Colleague' },
  { id: 'other', label: 'Other' }
];

const CAREGIVING_EXPERIENCE_LEVELS = [
  { id: 'none', label: 'No experience' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' }
];

const AREAS_OF_CARE = [
  { id: 'elderly', label: 'Elderly Care' },
  { id: 'children', label: 'Childcare' },
  { id: 'special_needs', label: 'Special Needs Care' },
  { id: 'disability', label: 'Disability Support' },
  { id: 'mental_health', label: 'Mental Health Support' },
  { id: 'chronic_illness', label: 'Chronic Illness Management' },
  { id: 'palliative', label: 'Palliative/End-of-Life Care' }
];

const SUPPORT_PREFERENCES = [
  { id: 'emotional', label: 'Emotional Support' },
  { id: 'practical', label: 'Practical Assistance' },
  { id: 'information', label: 'Information & Resources' },
  { id: 'respite', label: 'Respite Care' },
  { id: 'financial', label: 'Financial Assistance' }
];

const COMMUNICATION_PREFERENCES = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'text', label: 'Text Message' },
  { id: 'video', label: 'Video Call' },
  { id: 'in_person', label: 'In-Person Meetings' }
];

export default function FamilyRegistration() {
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
      relationship: '',
      caregivingExperience: '',
      areasOfCare: [] as string[],
      supportPreferences: [] as string[],
      communicationPreferences: [] as string[],
      additionalNotes: '',
      listInFamilyDirectory: false,
      enableFamilyNotifications: true
    }
  });

  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
      
      form.setValue('email', user.email || '');
      form.setValue('fullName', fullName);
      
      console.log('[FamilyRegistration] Pre-populated form with user data:', {
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
        avatarUrl = await uploadFile(profilePicture, 'avatars', `family/${userId}`);
        
        if (!avatarUrl) {
          toast.error("Failed to upload profile picture, but continuing with registration");
        } else {
          toast.success("Profile picture uploaded successfully");
        }
      }
      
      const profileData = {
        id: userId,
        full_name: data.fullName,
        role: 'family' as UserRole,
        avatar_url: avatarUrl,
        phone_number: data.phoneNumber,
        location: data.location,
        
        relationship: data.relationship,
        caregiving_experience: data.caregivingExperience,
        areas_of_care: data.areasOfCare,
        support_preferences: data.supportPreferences,
        communication_preferences: data.communicationPreferences,
        additional_notes: data.additionalNotes,
        list_in_family_directory: data.listInFamilyDirectory,
        enable_family_notifications: data.enableFamilyNotifications
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          role: 'family',
          full_name: data.fullName 
        }
      });
      
      if (metadataError) {
        console.error("Metadata update error:", metadataError);
        // Continue anyway as profile was updated
      }
      
      toast.success("Registration completed successfully!");
      
      setTimeout(() => {
        navigate('/dashboard/family');
      }, 1500);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      
      localStorage.setItem('family_registration_data', JSON.stringify(form.getValues()));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('family_registration_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
        toast.info("Restored your previous form data");
      } catch (e) {
        console.error("Failed to parse saved form data:", e);
        localStorage.removeItem('family_registration_data');
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
          <CardTitle>Family Member Registration</CardTitle>
          <CardDescription>
            Join our family network to connect, share, and support each other in caregiving.
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
                            <Input placeholder="e.g., +1 868 123 4567 or 868-123-4567" {...field} />
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
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Caregiving Details</h3>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your relationship to the person you're caring for</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELATIONSHIPS.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="caregivingExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your level of caregiving experience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CAREGIVING_EXPERIENCE_LEVELS.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="areasOfCare"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Areas of care you're involved in</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {AREAS_OF_CARE.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="areasOfCare"
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
                    name="supportPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Types of support you're interested in receiving</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {SUPPORT_PREFERENCES.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="supportPreferences"
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
                    name="communicationPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred communication channels</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {COMMUNICATION_PREFERENCES.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="communicationPreferences"
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
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional notes or information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share any additional information you think might be helpful"
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
                    name="listInFamilyDirectory"
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
                            List me in the family directory
                          </FormLabel>
                          <FormDescription>
                            Make your profile visible to other family members
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="enableFamilyNotifications"
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
                            Enable family notifications
                          </FormLabel>
                          <FormDescription>
                            Receive updates about events, opportunities, and family news
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
