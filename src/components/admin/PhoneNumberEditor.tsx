import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Edit3, Plus, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateChatInput } from "@/services/chat/utils/inputValidation";

interface PhoneNumberEditorProps {
  userId: string;
  currentPhoneNumber: string | null;
  userName: string;
  onPhoneNumberUpdate: (newPhoneNumber: string | null) => void;
}

export function PhoneNumberEditor({ 
  userId, 
  currentPhoneNumber, 
  userName, 
  onPhoneNumberUpdate 
}: PhoneNumberEditorProps) {
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
      // Handle removing phone number
      return updatePhoneNumber(null);
    }

    // Validate before saving
    const validation = validateChatInput(phoneNumber, 'phone');
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid phone number');
      return;
    }

    updatePhoneNumber(phoneNumber);
  };

  const updatePhoneNumber = async (newPhoneNumber: string | null) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          phone_number: newPhoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action for audit trail
      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: userId,
          action_type: 'admin_phone_number_update',
          session_id: `admin-${Date.now()}`,
          additional_data: {
            previous_phone: currentPhoneNumber,
            new_phone: newPhoneNumber,
            updated_by_admin: true,
            admin_user_id: (await supabase.auth.getUser()).data.user?.id,
            timestamp: new Date().toISOString()
          }
        });

      onPhoneNumberUpdate(newPhoneNumber);
      setIsEditing(false);
      setValidationError('');
      
      const action = newPhoneNumber ? 
        (currentPhoneNumber ? 'updated' : 'added') : 
        'removed';
      
      toast.success(`Phone number ${action} for ${userName}`);
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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Phone Number:</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            placeholder="+1XXXXXXXXXX or local format"
            className={`flex-1 ${validationError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          <Button
            onClick={savePhoneNumber}
            disabled={isLoading || !!validationError}
            size="sm"
            className="flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Save
          </Button>
          <Button
            onClick={cancelEdit}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
        </div>
        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Format: International (+1XXXXXXXXXX) or local (XXXXXXXXXX)
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Phone className="h-4 w-4 text-muted-foreground" />
      {currentPhoneNumber ? (
        <>
          <span className="text-sm">{currentPhoneNumber}</span>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm text-muted-foreground">No phone number</span>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-green-600 hover:text-green-700"
          >
            <Plus className="h-3 w-3" />
            Add Phone
          </Button>
        </>
      )}
    </div>
  );
}
