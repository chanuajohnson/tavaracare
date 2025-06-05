
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Edit3, Plus, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateChatInput } from "@/services/chat/utils/inputValidation";

interface InlinePhoneEditorProps {
  userId: string;
  currentPhoneNumber: string | null;
  userName: string;
  onPhoneNumberUpdate: (newPhoneNumber: string | null) => void;
}

export function InlinePhoneEditor({ 
  userId, 
  currentPhoneNumber, 
  userName, 
  onPhoneNumberUpdate 
}: InlinePhoneEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with +, keep it, otherwise add +1 if it's a 10-digit US number
    if (cleaned.startsWith('+')) {
      return cleaned;
    } else if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    
    // Validate in real-time
    if (formatted.trim()) {
      const validation = validateChatInput(formatted, 'phone');
      setValidationError(validation.isValid ? '' : validation.errorMessage || '');
    } else {
      setValidationError('');
    }
  };

  const savePhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      setValidationError('Phone number is required');
      return;
    }

    // Validate before saving
    const validation = validateChatInput(phoneNumber, 'phone');
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Update only the phone_number column to avoid triggering the journey progress update
      const { error } = await supabase
        .from('profiles')
        .update({ 
          phone_number: phoneNumber
        })
        .eq('id', userId);

      if (error) throw error;

      onPhoneNumberUpdate(phoneNumber);
      setIsEditing(false);
      setValidationError('');
      
      toast.success(`Phone number updated for ${userName}`);
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast.error(`Failed to update phone number: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setPhoneNumber(currentPhoneNumber || '');
    setIsEditing(false);
    setValidationError('');
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Input
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            placeholder="+1XXXXXXXXXX"
            className={`text-xs h-7 ${validationError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          <Button
            onClick={savePhoneNumber}
            disabled={isLoading || !!validationError || !phoneNumber.trim()}
            size="sm"
            className="h-7 px-2"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            onClick={cancelEdit}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="h-7 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        {validationError && (
          <p className="text-xs text-red-600">{validationError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Phone className="h-3 w-3 text-muted-foreground" />
      {currentPhoneNumber ? (
        <>
          <span className="text-xs">{currentPhoneNumber}</span>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-blue-600 hover:text-blue-700"
          >
            <Edit3 className="h-2 w-2" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-xs text-muted-foreground">No phone</span>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-green-600 hover:text-green-700"
          >
            <Plus className="h-2 w-2" />
          </Button>
        </>
      )}
    </div>
  );
}
