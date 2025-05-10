
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxWithLabelProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
}

export function CheckboxWithLabel({ id, label, checked, onCheckedChange, description }: CheckboxWithLabelProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
