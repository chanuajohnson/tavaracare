
import React from 'react';
import { RegistrationStep } from '@/types/registration';
import RegistrationWizard from '@/components/registration/RegistrationWizard';
import BasicInfoStep from '@/components/registration/steps/BasicInfoStep';

// Sample care types step component
const CareTypesStep: React.FC<any> = ({ data, onUpdate }) => {
  const careTypes = [
    { value: 'elder_care', label: 'Elder Care' },
    { value: 'post_surgery', label: 'Post-Surgery Recovery' },
    { value: 'disability', label: 'Disability Support' },
    { value: 'special_needs', label: 'Special Needs Care' },
    { value: 'respite', label: 'Respite Care' },
  ];
  
  const handleCareTypeChange = (type: string) => {
    const currentTypes = [...(data.careTypes || [])];
    const index = currentTypes.indexOf(type);
    
    if (index >= 0) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }
    
    onUpdate({ careTypes: currentTypes });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">What type of care do you need?</h2>
        <p className="text-muted-foreground">
          Select all that apply. This helps us match you with the right caregivers.
        </p>
      </div>
      
      <div className="space-y-4">
        {careTypes.map(type => (
          <div key={type.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={type.value}
              checked={(data.careTypes || []).includes(type.value)}
              onChange={() => handleCareTypeChange(type.value)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor={type.value} className="font-medium text-gray-700">
              {type.label}
            </label>
          </div>
        ))}
      </div>
      
      {(data.careTypes || []).includes('special_needs') && (
        <div className="p-4 bg-muted rounded-md">
          <h3 className="text-sm font-medium mb-2">Please tell us more about the special needs:</h3>
          <textarea
            value={data.specialNeedsDetails || ''}
            onChange={(e) => onUpdate({ specialNeedsDetails: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
            placeholder="Describe the special needs care requirements..."
          ></textarea>
        </div>
      )}
    </div>
  );
};

// Sample care urgency step component
const CareUrgencyStep: React.FC<any> = ({ data, onUpdate }) => {
  const handleUrgencyChange = (urgency: string) => {
    onUpdate({ careUrgency: urgency });
  };

  const urgencyOptions = [
    { value: 'immediate', label: 'Immediately (within 48 hours)' },
    { value: 'within_week', label: 'Within a week' },
    { value: 'within_month', label: 'Within a month' },
    { value: 'planning_ahead', label: 'Planning ahead (more than a month)' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">When do you need care to begin?</h2>
        <p className="text-muted-foreground">
          This helps us prioritize your request and find available caregivers.
        </p>
      </div>
      
      <div className="space-y-4">
        {urgencyOptions.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              id={option.value}
              name="careUrgency"
              checked={data.careUrgency === option.value}
              onChange={() => handleUrgencyChange(option.value)}
              className="rounded-full border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor={option.value} className="font-medium text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {data.careUrgency === 'immediate' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Urgent Care Request</h3>
          <p className="text-sm text-blue-700">
            We'll prioritize your request and contact you as soon as possible. 
            It helps to provide additional details about your urgent situation.
          </p>
          <textarea
            value={data.urgencyDetails || ''}
            onChange={(e) => onUpdate({ urgencyDetails: e.target.value })}
            className="w-full mt-2 rounded-md border border-blue-300 p-2"
            rows={3}
            placeholder="Tell us about your urgent care needs..."
          ></textarea>
        </div>
      )}
    </div>
  );
};

// Sample schedule preferences step
const SchedulePreferencesStep: React.FC<any> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Schedule Preferences</h2>
        <p className="text-muted-foreground">
          Let us know when you need care services.
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">What type of schedule are you looking for?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['Regular scheduled care', 'On-demand / as needed', 'One-time care', 'Not sure yet'].map(option => (
            <div key={option} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`schedule-${option}`}
                name="scheduleType"
                checked={data.scheduleType === option}
                onChange={() => onUpdate({ scheduleType: option })}
                className="rounded-full border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor={`schedule-${option}`} className="text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
        
        {data.scheduleType === 'Regular scheduled care' && (
          <div className="space-y-4 pt-2">
            <h3 className="font-medium">Which days do you need care?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={(data.careDays || []).includes(day)}
                    onChange={() => {
                      const currentDays = [...(data.careDays || [])];
                      const index = currentDays.indexOf(day);
                      
                      if (index >= 0) {
                        currentDays.splice(index, 1);
                      } else {
                        currentDays.push(day);
                      }
                      
                      onUpdate({ careDays: currentDays });
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`day-${day}`} className="text-sm">
                    {day}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <h3 className="font-medium mb-2">What hours do you need care?</h3>
              <select
                value={data.careHours || ''}
                onChange={(e) => onUpdate({ careHours: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select hours</option>
                <option value="morning">Morning (6am - 12pm)</option>
                <option value="afternoon">Afternoon (12pm - 6pm)</option>
                <option value="evening">Evening (6pm - 12am)</option>
                <option value="overnight">Overnight (12am - 6am)</option>
                <option value="full_day">Full day (8+ hours)</option>
                <option value="custom">Custom hours</option>
              </select>
              
              {data.careHours === 'custom' && (
                <div className="mt-2">
                  <textarea
                    value={data.customHours || ''}
                    onChange={(e) => onUpdate({ customHours: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2"
                    rows={2}
                    placeholder="Describe your preferred hours..."
                  ></textarea>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sample review and submit step
const ReviewSubmitStep: React.FC<any> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Basic Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Name:</div>
            <div>{data.fullName}</div>
            <div className="text-muted-foreground">Email:</div>
            <div>{data.email}</div>
            <div className="text-muted-foreground">Phone:</div>
            <div>{data.phone || 'Not provided'}</div>
            <div className="text-muted-foreground">Zip Code:</div>
            <div>{data.zipCode}</div>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Care Needs</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Care Types:</div>
            <div>{(data.careTypes || []).map((type: string) => type.replace('_', ' ')).join(', ') || 'None selected'}</div>
            <div className="text-muted-foreground">Care Urgency:</div>
            <div>{data.careUrgency ? data.careUrgency.replace('_', ' ') : 'Not specified'}</div>
            <div className="text-muted-foreground">Schedule Type:</div>
            <div>{data.scheduleType || 'Not specified'}</div>
            {data.scheduleType === 'Regular scheduled care' && (
              <>
                <div className="text-muted-foreground">Care Days:</div>
                <div>{(data.careDays || []).join(', ') || 'None selected'}</div>
                <div className="text-muted-foreground">Care Hours:</div>
                <div>{data.careHours === 'custom' ? data.customHours : data.careHours || 'Not specified'}</div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          By submitting this form, you agree to our Terms of Service and Privacy Policy. 
          We'll match you with caregivers based on the information you've provided.
        </p>
      </div>
    </div>
  );
};

const FamilyRegistration: React.FC = () => {
  // Define the steps for the family registration flow
  const registrationSteps: RegistrationStep[] = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Let\'s get to know you',
      isRequired: true,
      estimatedTimeSeconds: 60,
      component: BasicInfoStep,
      validateStep: (data) => {
        return !!(data.fullName && data.email && data.zipCode);
      }
    },
    {
      id: 'care_types',
      title: 'Care Needs',
      description: 'Tell us about the care you need',
      isRequired: true,
      estimatedTimeSeconds: 90,
      component: CareTypesStep,
      validateStep: (data) => {
        return Array.isArray(data.careTypes) && data.careTypes.length > 0;
      }
    },
    {
      id: 'care_urgency',
      title: 'Care Urgency',
      description: 'When do you need care?',
      isRequired: true,
      estimatedTimeSeconds: 30,
      component: CareUrgencyStep,
      validateStep: (data) => {
        return !!data.careUrgency;
      }
    },
    {
      id: 'schedule',
      title: 'Schedule Preferences',
      description: 'What schedule works for you?',
      isRequired: true,
      estimatedTimeSeconds: 120,
      component: SchedulePreferencesStep,
      validateStep: (data) => {
        return !!data.scheduleType;
      },
      // Only show schedule step if not an urgent need
      condition: (data) => data.careUrgency !== 'immediate'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Confirm your information',
      isRequired: true,
      estimatedTimeSeconds: 60,
      component: ReviewSubmitStep
    }
  ];

  const handleComplete = (data: Record<string, any>) => {
    console.log('Registration completed with data:', data);
    // Here you would typically update the user profile or other data in your system
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Family Registration</h1>
        <p className="text-muted-foreground mt-2">
          Tell us about your care needs so we can match you with the right caregivers
        </p>
      </div>
      
      <RegistrationWizard
        steps={registrationSteps}
        registrationFlowType="family"
        onComplete={handleComplete}
      />
    </div>
  );
};

export default FamilyRegistration;
