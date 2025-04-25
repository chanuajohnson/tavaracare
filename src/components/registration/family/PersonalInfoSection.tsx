
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PersonalInfoProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  avatarUrl: string | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoProps> = ({
  firstName,
  lastName,
  email,
  phoneNumber,
  address,
  avatarUrl,
  onFirstNameChange,
  onLastNameChange,
  onPhoneNumberChange,
  onAddressChange,
  onAvatarChange,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Personal & Contact Information</CardTitle>
        <CardDescription>
          Tell us about yourself so we can connect you with the right care providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : (
              <AvatarFallback>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <Label htmlFor="avatar" className="cursor-pointer text-primary">
            {avatarUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*" 
              onChange={onAvatarChange} 
              className="hidden" 
            />
          </Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input 
              id="firstName" 
              placeholder="First Name" 
              value={firstName} 
              onChange={(e) => onFirstNameChange(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input 
              id="lastName" 
              placeholder="Last Name" 
              value={lastName} 
              onChange={(e) => onLastNameChange(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} disabled />
          <p className="text-sm text-gray-500">Email address from your registration</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input 
            id="phoneNumber" 
            placeholder="Phone Number" 
            value={phoneNumber} 
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Location – Address/City of the care recipient *</Label>
          <Input 
            id="address" 
            placeholder="Address" 
            value={address} 
            onChange={(e) => onAddressChange(e.target.value)}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
