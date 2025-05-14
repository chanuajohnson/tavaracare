
import React from 'react';
import { useForm } from 'react-hook-form';
import { CareNeedsSectionProps } from '@/types/careNeedsTypes';

/**
 * This adapter converts between the formData/onChange pattern and a React Hook Form instance
 */
export function createFormAdapter<T>(
  Component: React.ComponentType<{ form: ReturnType<typeof useForm> }>
) {
  const FormAdapter = ({ formData, onChange }: CareNeedsSectionProps) => {
    const form = useForm({
      defaultValues: formData,
    });

    // Update the parent form when this form changes
    React.useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (name && value[name] !== undefined) {
          onChange(name, value[name]);
        }
      });
      
      return () => subscription.unsubscribe();
    }, [form, onChange]);

    return <Component form={form} />;
  };

  return FormAdapter;
}
