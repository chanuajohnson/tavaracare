
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RegistrationField } from '@/types/registration';
import { FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  field: RegistrationField;
  value: any;
  onChange: (id: string, value: any) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error
}) => {
  // If this field has a condition function and it evaluates to false, don't render it
  if (field.condition && !field.condition(value)) {
    return null;
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'phone':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className={cn(field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {field.label}
          </Label>
          <Input
            id={field.id}
            type={field.type === 'number' ? 'number' : field.type === 'phone' ? 'tel' : field.type}
            placeholder={field.placeholder}
            value={value?.[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            maxLength={field.maxLength}
            className={error ? 'border-red-500' : ''}
            required={field.isRequired}
          />
          {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className={cn(field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {field.label}
          </Label>
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value?.[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={error ? 'border-red-500' : ''}
            required={field.isRequired}
          />
          {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className={cn(field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {field.label}
          </Label>
          <Select 
            value={value?.[field.id] || ''} 
            onValueChange={(val) => onChange(field.id, val)}
          >
            <SelectTrigger id={field.id} className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          <Label className={cn(field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {field.label}
          </Label>
          <div className="border rounded-md p-4 space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={Array.isArray(value?.[field.id]) && value[field.id].includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value?.[field.id]) ? [...value[field.id]] : [];
                    if (checked) {
                      onChange(field.id, [...currentValues, option.value]);
                    } else {
                      onChange(field.id, currentValues.filter(v => v !== option.value));
                    }
                  }}
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-start space-x-2">
          <Checkbox
            id={field.id}
            checked={value?.[field.id] || false}
            onCheckedChange={(checked) => onChange(field.id, checked)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={field.id}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {field.label}
            </label>
            {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          <Label className={cn(field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {field.label}
          </Label>
          <RadioGroup
            value={value?.[field.id] || ''}
            onValueChange={(val) => onChange(field.id, val)}
            className="space-y-1"
          >
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className={cn(field.isRequired && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
            {field.label}
          </Label>
          <Input
            id={field.id}
            type="date"
            value={value?.[field.id] || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={error ? 'border-red-500' : ''}
            required={field.isRequired}
          />
          {field.helperText && <p className="text-sm text-muted-foreground">{field.helperText}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    default:
      return null;
  }
};

export default FormField;
