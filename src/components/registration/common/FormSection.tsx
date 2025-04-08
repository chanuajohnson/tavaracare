
import React from 'react';
import FormField from './FormField';
import { RegistrationField } from '@/types/registration';

interface FormSectionProps {
  title?: string;
  description?: string;
  fields: RegistrationField[];
  data: Record<string, any>;
  onChange: (id: string, value: any) => void;
  errors?: Record<string, string>;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  fields,
  data,
  onChange,
  errors = {},
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={data}
            onChange={onChange}
            error={errors[field.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSection;
