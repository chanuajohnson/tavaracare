
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
  label?: string;
  helpText?: string;
  isTextarea?: boolean;
  placeholder?: string;
}

export function DescriptionInput({
  value,
  onChange,
  maxLength = 150,
  className = "",
  label = "Description",
  helpText = "Provide a brief summary of this care plan (1-2 sentences)",
  isTextarea = true,
  placeholder = "Enter a concise description of this care plan..."
}: DescriptionInputProps) {
  const [charCount, setCharCount] = useState(value?.length || 0);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange(newValue.substring(0, maxLength));
  };

  const getCounterColor = () => {
    const percentage = (charCount / maxLength) * 100;
    if (percentage < 70) return "text-gray-500";
    if (percentage < 90) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-1.5">
        <Label htmlFor="description">{label}</Label>
        <span className={`text-xs font-mono ${getCounterColor()}`}>
          {charCount}/{maxLength}
        </span>
      </div>
      
      {isTextarea ? (
        <Textarea
          id="description"
          value={value || ""}
          onChange={handleChange}
          className="resize-none"
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <Input
          id="description"
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}
      
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {helpText}
        </p>
      )}
    </div>
  );
}
