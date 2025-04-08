
import React, { useState } from 'react';
import { RegistrationStepProps } from '@/types/registration';
import FormSection from '../common/FormSection';

const BasicInfoStep: React.FC<RegistrationStepProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: any) => {
    onUpdate({ [id]: value });
    
    // Clear error when field is edited
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!data.fullName?.trim()) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!data.zipCode?.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Proceed to next step if validation passes
    onNext();
  };

  const basicFields = [
    {
      id: 'fullName',
      type: 'text' as const,
      label: 'Full Name',
      placeholder: 'Enter your full name',
      isRequired: true,
    },
    {
      id: 'email',
      type: 'email' as const,
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      isRequired: true,
      helperText: 'We\'ll use this to send you important updates',
    },
    {
      id: 'phone',
      type: 'phone' as const,
      label: 'Phone Number',
      placeholder: '(555) 123-4567',
    },
    {
      id: 'zipCode',
      type: 'text' as const,
      label: 'Zip Code',
      placeholder: 'Enter your zip code',
      isRequired: true,
      helperText: 'We\'ll use this to find care providers in your area',
      maxLength: 10,
    },
    {
      id: 'referralSource',
      type: 'select' as const,
      label: 'How did you hear about us?',
      placeholder: 'Select an option',
      options: [
        { value: 'google', label: 'Google Search' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'friend', label: 'Friend or Family' },
        { value: 'healthcare', label: 'Healthcare Provider' },
        { value: 'other', label: 'Other' },
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Let's get started</h2>
          <p className="text-muted-foreground">
            Please provide your basic information to begin the registration process.
          </p>
        </div>

        <FormSection
          fields={basicFields}
          data={data}
          onChange={handleChange}
          errors={errors}
        />

        {/* Show 'referral_other' field conditionally if 'other' is selected */}
        {data.referralSource === 'other' && (
          <FormSection
            fields={[
              {
                id: 'referralOther',
                type: 'text' as const,
                label: 'Please specify how you heard about us',
                placeholder: 'Enter source',
              },
            ]}
            data={data}
            onChange={handleChange}
            errors={errors}
          />
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="hidden"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default BasicInfoStep;
