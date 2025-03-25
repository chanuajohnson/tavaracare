
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTracking } from '@/hooks/useTracking';
import { UserJourneyTracker } from '@/components/tracking/UserJourneyTracker';

const ProfessionalRegistration = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { trackEngagement } = useTracking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [professionalInfo, setProfessionalInfo] = useState({
    professionalType: '',
    careServices: [] as string[],
    hourlyRate: '',
    years: '',
    workType: '',
    emergencyContact: '',
    preferredSchedule: [] as string[],
    administersmedication: false,
    providesTransportation: false,
    backgroundCheck: false,
    hasInsurance: false,
    providesHousekeeping: false,
    handlesMedicalEquipment: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole && userRole !== 'professional') {
      navigate(`/registration/${userRole.toLowerCase()}`);
      return;
    }

    // Initial load of existing profile data if any
    const loadProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('professional_type, care_services, hourly_rate, years_of_experience, work_type, emergency_contact, availability, administers_medication, provides_transportation, background_check, has_liability_insurance, provides_housekeeping, handles_medical_equipment')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setProfessionalInfo({
            professionalType: data.professional_type || '',
            careServices: data.care_services || [],
            hourlyRate: data.hourly_rate || '',
            years: data.years_of_experience || '',
            workType: data.work_type || '',
            emergencyContact: data.emergency_contact || '',
            preferredSchedule: data.availability || [],
            administersmedication: data.administers_medication || false,
            providesTransportation: data.provides_transportation || false,
            backgroundCheck: data.background_check || false,
            hasInsurance: data.has_liability_insurance || false,
            providesHousekeeping: data.provides_housekeeping || false,
            handlesMedicalEquipment: data.handles_medical_equipment || false
          });
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast.error(`Failed to load profile: ${error.message}`);
      }
    };

    loadProfileData();
  }, [user, userRole, navigate]);

  const handleChange = (field: string, value: any) => {
    setProfessionalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCareService = (service: string) => {
    setProfessionalInfo(prev => {
      const updatedServices = prev.careServices.includes(service)
        ? prev.careServices.filter(s => s !== service)
        : [...prev.careServices, service];
      
      return {
        ...prev,
        careServices: updatedServices
      };
    });
  };

  const toggleSchedule = (schedule: string) => {
    setProfessionalInfo(prev => {
      const updatedSchedule = prev.preferredSchedule.includes(schedule)
        ? prev.preferredSchedule.filter(s => s !== schedule)
        : [...prev.preferredSchedule, schedule];
      
      return {
        ...prev,
        preferredSchedule: updatedSchedule
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to complete registration");
      navigate('/auth');
      return;
    }

    if (!professionalInfo.professionalType) {
      toast.warning("Please select your professional type");
      return;
    }

    if (professionalInfo.careServices.length === 0) {
      toast.warning("Please select at least one care service");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track registration start
      await trackEngagement('registration_started', {
        role: 'professional',
        professional_type: professionalInfo.professionalType
      });
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          professional_type: professionalInfo.professionalType,
          care_services: professionalInfo.careServices,
          hourly_rate: professionalInfo.hourlyRate,
          years_of_experience: professionalInfo.years,
          work_type: professionalInfo.workType,
          emergency_contact: professionalInfo.emergencyContact,
          availability: professionalInfo.preferredSchedule,
          administers_medication: professionalInfo.administersmedication,
          provides_transportation: professionalInfo.providesTransportation,
          background_check: professionalInfo.backgroundCheck,
          has_liability_insurance: professionalInfo.hasInsurance,
          provides_housekeeping: professionalInfo.providesHousekeeping,
          handles_medical_equipment: professionalInfo.handlesMedicalEquipment,
          updated_at: new Date().toISOString(),
          registration_skipped: false
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      // Also update the user's metadata
      await supabase.auth.updateUser({
        data: { 
          professionalType: professionalInfo.professionalType,
          registrationComplete: true,
          registrationSkipped: false
        }
      });

      // Track registration completion
      await trackEngagement('registration_completed', {
        role: 'professional',
        professional_type: professionalInfo.professionalType
      });
      
      toast.success("Registration completed successfully!");
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error("Error during registration:", error);
      toast.error(`Registration error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipRegistration = async () => {
    if (!user) {
      toast.error("You must be logged in to skip registration");
      navigate('/auth');
      return;
    }
    
    setIsSkipping(true);
    
    try {
      // Update the profile to mark registration as skipped
      const { error } = await supabase
        .from('profiles')
        .update({
          registration_skipped: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: { 
          registrationSkipped: true
        }
      });

      // Track that registration was skipped
      await trackEngagement('registration_skipped', {
        role: 'professional'
      });
      
      toast.warning("Profile completion has been skipped. Some features may be limited.");
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error("Error skipping registration:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSkipping(false);
    }
  };

  if (!user) {
    return null; // Will redirect to auth page via useEffect
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <UserJourneyTracker journeyStage="profile_creation" additionalData={{ role: 'professional' }} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Professional Profile Setup</h1>
          <p className="text-gray-600 mt-2">
            Tell us about your caregiving services to connect with families who need your help
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Basic details about your caregiving services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="professionalType">Professional Type *</Label>
                  <Select 
                    value={professionalInfo.professionalType} 
                    onValueChange={(value) => handleChange('professionalType', value)}
                  >
                    <SelectTrigger id="professionalType">
                      <SelectValue placeholder="Select your professional type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Registered Nurse">Registered Nurse</SelectItem>
                      <SelectItem value="Licensed Practical Nurse">Licensed Practical Nurse</SelectItem>
                      <SelectItem value="Certified Nursing Assistant">Certified Nursing Assistant</SelectItem>
                      <SelectItem value="Home Health Aide">Home Health Aide</SelectItem>
                      <SelectItem value="Personal Care Aide">Personal Care Aide</SelectItem>
                      <SelectItem value="Companion Caregiver">Companion Caregiver</SelectItem>
                      <SelectItem value="Physical Therapist">Physical Therapist</SelectItem>
                      <SelectItem value="Occupational Therapist">Occupational Therapist</SelectItem>
                      <SelectItem value="Social Worker">Social Worker</SelectItem>
                      <SelectItem value="Other Healthcare Professional">Other Healthcare Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2">Care Services Offered *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="personal-care" 
                        checked={professionalInfo.careServices.includes('Personal Care')}
                        onCheckedChange={() => toggleCareService('Personal Care')}
                      />
                      <Label htmlFor="personal-care">Personal Care</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="companion-care" 
                        checked={professionalInfo.careServices.includes('Companion Care')}
                        onCheckedChange={() => toggleCareService('Companion Care')}
                      />
                      <Label htmlFor="companion-care">Companion Care</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="medication-management" 
                        checked={professionalInfo.careServices.includes('Medication Management')}
                        onCheckedChange={() => toggleCareService('Medication Management')}
                      />
                      <Label htmlFor="medication-management">Medication Management</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="skilled-nursing" 
                        checked={professionalInfo.careServices.includes('Skilled Nursing')}
                        onCheckedChange={() => toggleCareService('Skilled Nursing')}
                      />
                      <Label htmlFor="skilled-nursing">Skilled Nursing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="therapy-services" 
                        checked={professionalInfo.careServices.includes('Therapy Services')}
                        onCheckedChange={() => toggleCareService('Therapy Services')}
                      />
                      <Label htmlFor="therapy-services">Therapy Services</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="respite-care" 
                        checked={professionalInfo.careServices.includes('Respite Care')}
                        onCheckedChange={() => toggleCareService('Respite Care')}
                      />
                      <Label htmlFor="respite-care">Respite Care</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hospice-care" 
                        checked={professionalInfo.careServices.includes('Hospice Care')}
                        onCheckedChange={() => toggleCareService('Hospice Care')}
                      />
                      <Label htmlFor="hospice-care">Hospice Care</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dementia-care" 
                        checked={professionalInfo.careServices.includes('Dementia Care')}
                        onCheckedChange={() => toggleCareService('Dementia Care')}
                      />
                      <Label htmlFor="dementia-care">Dementia Care</Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate / Salary Expectations</Label>
                    <Input 
                      id="hourlyRate" 
                      placeholder="e.g., $25/hour or salary range" 
                      value={professionalInfo.hourlyRate}
                      onChange={(e) => handleChange('hourlyRate', e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="years">Years of Experience</Label>
                    <Select 
                      value={professionalInfo.years} 
                      onValueChange={(value) => handleChange('years', value)}
                    >
                      <SelectTrigger id="years">
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="6-10 years">6-10 years</SelectItem>
                        <SelectItem value="Over 10 years">Over 10 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="workType">Work Arrangement</Label>
                  <Select 
                    value={professionalInfo.workType} 
                    onValueChange={(value) => handleChange('workType', value)}
                  >
                    <SelectTrigger id="workType">
                      <SelectValue placeholder="Select work arrangement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Live-in">Live-in</SelectItem>
                      <SelectItem value="Flexible / On-Demand">Flexible / On-Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input 
                    id="emergencyContact" 
                    placeholder="Name, relationship, phone number" 
                    value={professionalInfo.emergencyContact}
                    onChange={(e) => handleChange('emergencyContact', e.target.value)} 
                  />
                  <p className="text-xs text-gray-500 mt-1">For caregivers' safety</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Availability & Preferences</CardTitle>
              <CardDescription>Let families know when you're available to work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="block mb-2">Preferred Schedule</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekday-mornings" 
                      checked={professionalInfo.preferredSchedule.includes('Weekday Mornings')}
                      onCheckedChange={() => toggleSchedule('Weekday Mornings')}
                    />
                    <Label htmlFor="weekday-mornings">Weekday Mornings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekday-afternoons" 
                      checked={professionalInfo.preferredSchedule.includes('Weekday Afternoons')}
                      onCheckedChange={() => toggleSchedule('Weekday Afternoons')}
                    />
                    <Label htmlFor="weekday-afternoons">Weekday Afternoons</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekday-evenings" 
                      checked={professionalInfo.preferredSchedule.includes('Weekday Evenings')}
                      onCheckedChange={() => toggleSchedule('Weekday Evenings')}
                    />
                    <Label htmlFor="weekday-evenings">Weekday Evenings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekend-mornings" 
                      checked={professionalInfo.preferredSchedule.includes('Weekend Mornings')}
                      onCheckedChange={() => toggleSchedule('Weekend Mornings')}
                    />
                    <Label htmlFor="weekend-mornings">Weekend Mornings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekend-afternoons" 
                      checked={professionalInfo.preferredSchedule.includes('Weekend Afternoons')}
                      onCheckedChange={() => toggleSchedule('Weekend Afternoons')}
                    />
                    <Label htmlFor="weekend-afternoons">Weekend Afternoons</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekend-evenings" 
                      checked={professionalInfo.preferredSchedule.includes('Weekend Evenings')}
                      onCheckedChange={() => toggleSchedule('Weekend Evenings')}
                    />
                    <Label htmlFor="weekend-evenings">Weekend Evenings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="overnight" 
                      checked={professionalInfo.preferredSchedule.includes('Overnight')}
                      onCheckedChange={() => toggleSchedule('Overnight')}
                    />
                    <Label htmlFor="overnight">Overnight</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="24-hour" 
                      checked={professionalInfo.preferredSchedule.includes('24-Hour Care')}
                      onCheckedChange={() => toggleSchedule('24-Hour Care')}
                    />
                    <Label htmlFor="24-hour">24-Hour Care</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Details & Compliance</CardTitle>
              <CardDescription>Required verification and any additional information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="block mb-2">Are you comfortable with:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="administers-medication" 
                        checked={professionalInfo.administersmedication}
                        onCheckedChange={(checked) => handleChange('administersMediation', checked === true)}
                      />
                      <Label htmlFor="administers-medication">Administering Medication</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="provides-housekeeping" 
                        checked={professionalInfo.providesHousekeeping}
                        onCheckedChange={(checked) => handleChange('providesHousekeeping', checked === true)}
                      />
                      <Label htmlFor="provides-housekeeping">Housekeeping / Meal Preparation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="provides-transportation" 
                        checked={professionalInfo.providesTransportation}
                        onCheckedChange={(checked) => handleChange('providesTransportation', checked === true)}
                      />
                      <Label htmlFor="provides-transportation">Transportation for Appointments</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="handles-medical-equipment" 
                        checked={professionalInfo.handlesMedicalEquipment}
                        onCheckedChange={(checked) => handleChange('handlesMedicalEquipment', checked === true)}
                      />
                      <Label htmlFor="handles-medical-equipment">Handling Medical Equipment</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="background-check" 
                      checked={professionalInfo.backgroundCheck}
                      onCheckedChange={(checked) => handleChange('backgroundCheck', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="background-check" className="leading-tight">
                      I consent to a background check if required by families
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="has-insurance" 
                      checked={professionalInfo.hasInsurance}
                      onCheckedChange={(checked) => handleChange('hasInsurance', checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="has-insurance" className="leading-tight">
                      I have liability insurance (for independent caregivers)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipRegistration}
              disabled={isSubmitting || isSkipping}
            >
              {isSkipping ? 'Skipping...' : 'Skip for now'}
            </Button>
            
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/professional')}
                disabled={isSubmitting || isSkipping}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || isSkipping}
              >
                {isSubmitting ? 'Saving...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;
