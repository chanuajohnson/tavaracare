import React, { forwardRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCode } from './QRCode';
import { SpotlightCaregiver } from '@/services/spotlightService';

interface CaregiverShareCardProps {
  caregiver: SpotlightCaregiver;
  format?: 'square' | 'story';
  id?: string;
}

export const CaregiverShareCard = forwardRef<HTMLDivElement, CaregiverShareCardProps>(
  ({ caregiver, format = 'square', id }, ref) => {
    const isStory = format === 'story';
    const dimensions = isStory 
      ? { width: 540, height: 960 } // 1080x1920 at 0.5x for preview
      : { width: 540, height: 540 }; // 1080x1080 at 0.5x for preview

    const firstName = caregiver.profile.firstName || caregiver.profile.fullName?.split(' ')[0] || 'Caregiver';
    const initials = caregiver.profile.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CG';

    const location = caregiver.profile.location || caregiver.profile.address || 'Trinidad & Tobago';
    const experience = caregiver.profile.yearsOfExperience || '3-5 years';

    return (
      <div
        ref={ref}
        id={id}
        className="bg-white flex flex-col"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <div 
          className="text-center py-4 px-6"
          style={{ backgroundColor: 'hsl(215, 62%, 65%)' }}
        >
          <div className="flex items-center justify-center gap-2 text-white mb-1">
            <span className="text-xl">🏡</span>
            <span className="text-xl font-bold tracking-wide">Tavara.care</span>
          </div>
          <p className="text-white/90 text-sm italic">"It takes a village"</p>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col items-center justify-center px-8 ${isStory ? 'py-12' : 'py-6'}`}>
          {/* Avatar */}
          <Avatar className={`border-4 border-primary/20 shadow-lg ${isStory ? 'h-32 w-32 mb-6' : 'h-24 w-24 mb-4'}`}>
            <AvatarImage src={caregiver.profile.avatarUrl} alt={firstName} />
            <AvatarFallback 
              className="text-2xl font-bold"
              style={{ backgroundColor: 'hsl(215, 62%, 85%)', color: 'hsl(215, 62%, 35%)' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="text-center mb-2">
            <p className="text-3xl font-bold text-gray-800" style={{ letterSpacing: '0.05em' }}>
              ✨ {firstName.toUpperCase()} ✨
            </p>
          </div>

          {/* Headline */}
          <p 
            className="text-center font-medium mb-4"
            style={{ color: 'hsl(215, 62%, 45%)', fontSize: '1.1rem' }}
          >
            {caregiver.headline}
          </p>

          {/* Info */}
          <div className="space-y-2 text-center mb-6">
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <span>📍</span> {location}
            </p>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <span>🕐</span> {experience} Experience
            </p>
          </div>

          {/* Available Badge */}
          <div 
            className="rounded-xl px-6 py-3 mb-6"
            style={{ backgroundColor: 'hsl(142, 76%, 95%)', border: '2px solid hsl(142, 76%, 45%)' }}
          >
            <p 
              className="font-bold text-lg"
              style={{ color: 'hsl(142, 76%, 35%)' }}
            >
              ✅ AVAILABLE NOW
            </p>
            <p 
              className="text-sm text-center"
              style={{ color: 'hsl(142, 76%, 35%)' }}
            >
              for families
            </p>
          </div>

          {/* QR Code + WhatsApp */}
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg shadow-sm border">
              <QRCode 
                url={`${PRODUCTION_BASE_URL}/urgent-caregivers?utm_source=caregiver_card`}
                size={60}
              />
            </div>
            <div className="text-left">
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <span>📲</span> WhatsApp me
              </p>
              <p className="font-bold text-gray-800">+1 (868) 786-5357</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="text-center py-3"
          style={{ backgroundColor: 'hsl(215, 62%, 97%)' }}
        >
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span>🇹🇹</span> Serving Trinidad & Tobago
          </p>
        </div>
      </div>
    );
  }
);

CaregiverShareCard.displayName = 'CaregiverShareCard';
