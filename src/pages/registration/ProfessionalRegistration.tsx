
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define form schema with Zod
const professionalFormSchema = z.object({
  // Personal Information
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  professional_type: z.string().min(1, 'Professional role is required'),
  other_professional_type: z.string().optional(),
  years_of_experience: z.string().min(1, 'Years of experience is required'),
  certifications: z.string().optional(),
  
  // Contact Information
  location: z.string().min(1, 'Location is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  preferred_contact_method: z.string().optional(),
  
  // Care Services
  care_services: z.array(z.string()).optional(),
  medical_conditions_experience: z.array(z.string()).optional(),
  other_medical_condition: z.string().optional(),
  
  // Availability & Preferences
  availability: z.array(z.string()).optional(),
  work_type: z.string().optional(),
  preferred_matches: z.array(z.string()).optional(),
  
  // Compliance & Additional Details
  administers_medication: z.boolean().optional(),
  provides_housekeeping: z.boolean().optional(),
  provides_transportation: z.boolean().optional(),
  handles_medical_equipment: z.boolean().optional(),
  has_liability_insurance: z.boolean().optional(),
  background_check: z.boolean().optional(),
  emergency_contact: z.string().optional(),
  hourly_rate: z.string().optional(),
  additional_professional_notes: z.string().optional(),
  
  // Terms and Conditions
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageURL, setProfileImageURL] = useState<string | null>(null);
  const [isProfileManagement, setIsProfileManagement] = useState(false);
  const [isSkippingRegistration, setIsSkippingRegistration] = useState(false);
  
  const { 
    control, 
    register, 
    handleSubmit, 
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      email: user?.email || '',
      first_name: '',
      last_name: '',
      professional_type: '',
      years_of_experience: '',
      location: '',
      phone: '',
      preferred_contact_method: '',
      care_services: [],
      medical_conditions_experience: [],
      other_medical_condition: '',
      availability: [],
      work_type: '',
      preferred_matches: [],
      administers_medication: false,
      provides_housekeeping: false,
      provides_transportation: false,
      handles_medical_equipment: false,
      has_liability_insurance: false,
      background_check: false,
      emergency_contact: '',
      hourly_rate: '',
      additional_professional_notes: '',
      terms_accepted: false,
    }
  });
  
  const selectedProfessionalType = watch('professional_type');

  // Check if the user is here for profile management (has an existing profile)
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (profileData && profileData.role === 'professional') {
          setIsProfileManagement(true);
          
          // Set profile image if it exists
          if (profileData.avatar_url) {
            const { data: { publicUrl } } = supabase
              .storage
              .from('profile-images')
              .getPublicUrl(profileData.avatar_url);
              
            setProfileImageURL(publicUrl);
          }
          
          // Populate form with existing data
          const names = profileData.full_name ? profileData.full_name.split(' ') : ['', ''];
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || '';
          
          // Set form values
          reset({
            first_name: firstName,
            last_name: lastName,
            professional_type: profileData.professional_type || '',
            other_professional_type: profileData.other_certification || '',
            years_of_experience: profileData.years_of_experience || '',
            certifications: profileData.certifications ? profileData.certifications[0] : '',
            location: profileData.location || profileData.address || '',
            email: user.email || '',
            phone: profileData.phone_number || '',
            preferred_contact_method: profileData.preferred_contact_method || '',
            care_services: profileData.care_services || [],
            medical_conditions_experience: profileData.medical_conditions_experience || [],
            other_medical_condition: profileData.other_medical_condition || '',
            availability: profileData.availability || [],
            work_type: profileData.work_type || '',
            preferred_matches: [], // Not clear where this is stored in the profile
            administers_medication: profileData.administers_medication || false,
            provides_housekeeping: profileData.provides_housekeeping || false,
            provides_transportation: profileData.provides_transportation || false,
            handles_medical_equipment: profileData.handles_medical_equipment || false,
            has_liability_insurance: profileData.has_liability_insurance || false,
            background_check: profileData.background_check || false,
            emergency_contact: profileData.emergency_contact || '',
            hourly_rate: profileData.hourly_rate || '',
            additional_professional_notes: profileData.additional_professional_notes || '',
            terms_accepted: true, // Already accepted if they have a profile
          });
          
          // Log that we loaded profile data
          console.log('Loaded professional profile data:', profileData);
        }
      } catch (error) {
        console.error('Error loading professional profile:', error);
        toast.error('Failed to load profile data');
      }
    };
    
    checkExistingProfile();
  }, [user, reset]);
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageURL(URL.createObjectURL(file));
    }
  };
  
  const handleSkipRegistration = async () => {
    setIsSkippingRegistration(true);
    
    try {
      if (!user) {
        toast.error("You must be logged in to skip registration");
        return;
      }
      
      // Update user metadata to indicate registration was skipped
      await supabase.auth.updateUser({
        data: { registrationSkipped: true, role: 'professional' }
      });
      
      // Also update the profile table with minimal information
      await supabase
        .from('profiles')
        .update({
          role: 'professional',
          registration_skipped: true
        })
        .eq('id', user.id);
      
      toast({
        title: "Registration skipped",
        description: "You can complete your profile later. Some features may be limited until then.",
        variant: "warning",
        duration: 5000
      });
      
      // Navigate to professional dashboard
      navigate('/dashboard/professional');
    } catch (error) {
      console.error('Error skipping registration:', error);
      toast.error("Error skipping registration. Please try again.");
    } finally {
      setIsSkippingRegistration(false);
    }
  };
  
  const onSubmit = async (data: ProfessionalFormValues) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error("You must be logged in to register");
        return;
      }
  
      let avatar_url = null;
  
      // Upload profile image if it exists
      if (profileImage) {
        const filename = `${uuidv4()}-${profileImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filename, profileImage);
  
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }
  
        avatar_url = filename;
      }
      
      // Combine first and last name for full_name
      const full_name = `${data.first_name} ${data.last_name}`.trim();
  
      // Update profile directly
      const { error } = await supabase
        .from('profiles')
        .update({
          // Basic information
          full_name,
          avatar_url: avatar_url || undefined, // Only update if we have a new image
          phone_number: data.phone,
          address: data.location,
          location: data.location,
          preferred_contact_method: data.preferred_contact_method,
          
          // Professional specific fields
          professional_type: data.professional_type,
          other_certification: data.other_professional_type,
          years_of_experience: data.years_of_experience,
          certifications: data.certifications ? [data.certifications] : [],
          care_services: data.care_services,
          medical_conditions_experience: data.medical_conditions_experience,
          other_medical_condition: data.other_medical_condition,
          availability: data.availability,
          work_type: data.work_type,
          
          // Specific capabilities
          administers_medication: data.administers_medication,
          provides_housekeeping: data.provides_housekeeping,
          provides_transportation: data.provides_transportation,
          handles_medical_equipment: data.handles_medical_equipment,
          has_liability_insurance: data.has_liability_insurance,
          background_check: data.background_check,
          
          // Additional information
          emergency_contact: data.emergency_contact,
          hourly_rate: data.hourly_rate,
          additional_professional_notes: data.additional_professional_notes,
          
          // Important role flag
          role: 'professional',
          
          // First name and last name separately
          first_name: data.first_name,
          last_name: data.last_name,
          
          // Clear registration_skipped flag if it was set
          registration_skipped: false
        })
        .eq('id', user.id);
  
      if (error) {
        console.error("Error updating profile:", error);
        throw new Error(`Error updating professional profile: ${error.message}`);
      }
      
      // Update user metadata to match database role and clear registrationSkipped flag
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'professional', registrationSkipped: false }
      });
      
      if (metadataError) {
        console.warn("Error updating user metadata:", metadataError);
        // Continue anyway - this is not critical
      }
  
      toast.success(isProfileManagement 
        ? "Profile updated successfully!" 
        : "Professional registration completed successfully!"
      );
      
      // Navigate directly to the professional dashboard
      navigate('/dashboard/professional');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">
        {isProfileManagement ? 'Manage Professional Profile' : 'Professional Registration'}
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        {isProfileManagement 
          ? 'Update your profile information to better connect with families.' 
          : 'Complete your profile to connect with families and showcase your professional services.'}
      </p>
      
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-100 text-blue-800 rounded-full p-1">🔹</span>
          <span>Direct Caregiver-to-Family Matching – Ensures families get the right professional for their needs.</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-100 text-blue-800 rounded-full p-1">🔹</span>
          <span>Smoother Hiring Process – Caregivers can specify exactly what services they provide.</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-100 text-blue-800 rounded-full p-1">🔹</span>
          <span>Trust & Safety Measures – Background checks, references, and compliance are captured.</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-blue-100 text-blue-800 rounded-full p-1">🔹</span>
          <span>Availability-Based Matches – Filters caregivers by their schedule, role, and medical expertise.</span>
        </div>
      </div>
      
      {/* Add skip registration button and info message */}
      {!isProfileManagement && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-amber-800">Want to explore first?</h3>
              <p className="text-sm text-amber-700">
                You can skip completing your profile for now, but some features will be limited until you return to finish.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={handleSkipRegistration}
              disabled={isSkippingRegistration}
            >
              {isSkippingRegistration ? "Processing..." : "Skip for now"}
            </Button>
          </div>
        </div>
      )}
  
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">Personal & Contact Information</h2>
            <p className="text-sm text-muted-foreground mb-4">Tell us about yourself so families can learn more about you.</p>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-2 overflow-hidden">
                {profileImageURL ? (
                  <img src={profileImageURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl text-slate-300">👤</div>
                )}
              </div>
              <label 
                htmlFor="profile-image" 
                className="text-sm text-blue-600 cursor-pointer hover:underline"
              >
                Upload Profile Picture
              </label>
              <input 
                id="profile-image" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleProfileImageChange}
              />
            </div>
            
            <h3 className="font-medium mb-2">✅ Essential Personal Information (Required)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="first-name" className="mb-1">First Name <span className="text-red-500">*</span></Label>
                <Input
                  id="first-name"
                  placeholder="Enter your first name"
                  {...register('first_name')}
                  className={errors.first_name ? "border-red-500" : ""}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="last-name" className="mb-1">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  id="last-name"
                  placeholder="Enter your last name"
                  {...register('last_name')}
                  className={errors.last_name ? "border-red-500" : ""}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="professional-type" className="mb-1">Professional Role <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="professional_type"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger className={errors.professional_type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agency">👨‍👦 Professional Agency</SelectItem>
                        <SelectItem value="nurse">🏥 Licensed Nurse (LPN/RN/BSN)</SelectItem>
                        <SelectItem value="hha">🏠 Home Health Aide (HHA)</SelectItem>
                        <SelectItem value="cna">👩‍⚕️ Certified Nursing Assistant (CNA)</SelectItem>
                        <SelectItem value="special_needs">🧠 Special Needs Caregiver</SelectItem>
                        <SelectItem value="therapist">🏋️ Physical / Occupational Therapist</SelectItem>
                        <SelectItem value="nutritionist">🍽️ Nutritional & Dietary Specialist</SelectItem>
                        <SelectItem value="medication">💊 Medication Management Expert</SelectItem>
                        <SelectItem value="elderly">👨‍🦽 Elderly & Mobility Support</SelectItem>
                        <SelectItem value="holistic">🌱 Holistic Care & Wellness</SelectItem>
                        <SelectItem value="gapp">👨‍👦 The Geriatric Adolescent Partnership Programme (GAPP)</SelectItem>
                        <SelectItem value="other">⚕️ Other (Please specify)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.professional_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.professional_type.message}</p>
                )}
              </div>
              
              {selectedProfessionalType === 'other' && (
                <div>
                  <Label htmlFor="other-professional-type" className="mb-1">Specify Professional Role <span className="text-red-500">*</span></Label>
                  <Input
                    id="other-professional-type"
                    placeholder="Specify your professional role"
                    {...register('other_professional_type')}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="years-of-experience" className="mb-1">Years of Experience <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="years_of_experience"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger className={errors.years_of_experience ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select experience range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.years_of_experience && (
                  <p className="text-red-500 text-sm mt-1">{errors.years_of_experience.message}</p>
                )}
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="certifications" className="mb-1">Certifications & Licenses</Label>
                <Textarea
                  id="certifications"
                  placeholder="List any relevant certifications, licenses, or training you have received (CPR, First Aid, Nursing License, etc.)"
                  {...register('certifications')}
                />
                <p className="text-xs text-muted-foreground mt-1">You'll be able to upload supporting documents later</p>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="location" className="mb-1">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  placeholder="City, State, Country"
                  {...register('location')}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone" className="mb-1">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  placeholder="Phone Number"
                  {...register('phone')}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="mb-1">Email Address</Label>
                <Input
                  id="email"
                  readOnly
                  {...register('email')}
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">Email address from your registration</p>
              </div>
              
              <div>
                <Label htmlFor="preferred-contact-method" className="mb-1">Preferred Contact Method</Label>
                <Controller
                  control={control}
                  name="preferred_contact_method"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Contact Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">📞 Call</SelectItem>
                        <SelectItem value="text">✉️ Text Message</SelectItem>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="app">💬 App Messaging</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">🟡 Care Services & Specializations</h2>
            <p className="text-sm text-muted-foreground mb-4">Tell us about the types of care services you provide. This helps match you with families that need your specific skills.</p>
            
            <div className="mb-6">
              <Label className="mb-3 block">What type of care do you provide? (Check all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="in-home"
                        checked={field.value?.includes('in_home')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'in_home']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'in_home'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="in-home" className="leading-tight cursor-pointer">
                    🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="medical-support"
                        checked={field.value?.includes('medical_support')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'medical_support']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'medical_support'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="medical-support" className="leading-tight cursor-pointer">
                    🏥 Medical Support (Post-surgery, Chronic Conditions, Hospice)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="special-needs"
                        checked={field.value?.includes('special_needs')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'special_needs']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'special_needs'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="special-needs" className="leading-tight cursor-pointer">
                    🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="memory-care"
                        checked={field.value?.includes('memory_care')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'memory_care']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'memory_care'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="memory-care" className="leading-tight cursor-pointer">
                    🧠 Cognitive & Memory Care (Alzheimer's, Dementia, Parkinson's)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="mobility"
                        checked={field.value?.includes('mobility')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'mobility']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'mobility'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="mobility" className="leading-tight cursor-pointer">
                    ♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="medication"
                        checked={field.value?.includes('medication')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'medication']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'medication'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="medication" className="leading-tight cursor-pointer">
                    💊 Medication Management (Administering Medication, Medical Equipment)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="nutritional"
                        checked={field.value?.includes('nutritional')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'nutritional']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'nutritional'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="nutritional" className="leading-tight cursor-pointer">
                    🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Controller
                    control={control}
                    name="care_services"
                    render={({ field }) => (
                      <Checkbox
                        id="household"
                        checked={field.value?.includes('household')}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            setValue('care_services', [...currentValues, 'household']);
                          } else {
                            setValue('care_services', currentValues.filter(value => value !== 'household'));
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="household" className="leading-tight cursor-pointer">
                    🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden)
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-24"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-36"
          >
            {isSubmitting ? "Saving..." : (isProfileManagement ? "Update Profile" : "Complete Registration")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalRegistration;
