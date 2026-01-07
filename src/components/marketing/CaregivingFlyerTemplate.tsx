import React from 'react';
import { QRCode } from './QRCode';
import { Phone, Heart, Pill, Car, UtensilsCrossed, PersonStanding } from 'lucide-react';

interface CaregivingFlyerTemplateProps {
  id?: string;
}

export const CaregivingFlyerTemplate: React.FC<CaregivingFlyerTemplateProps> = ({ 
  id = 'caregiving-flyer' 
}) => {
  const services = [
    { icon: PersonStanding, label: 'Personal Care' },
    { icon: Heart, label: 'Companionship' },
    { icon: Pill, label: 'Medication Support' },
    { icon: PersonStanding, label: 'Mobility Assistance' },
    { icon: UtensilsCrossed, label: 'Meal Preparation' },
    { icon: Car, label: 'Transportation' },
  ];

  return (
    <div 
      id={id}
      className="relative overflow-hidden bg-white"
      style={{ 
        width: '550px', 
        height: '850px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/marketing/flyer-background.png)',
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-8 text-white">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#6B9FDB' }}>
            Tavara.care
          </h1>
          <p className="text-lg mt-1 italic opacity-90">
            It takes a village to care
          </p>
        </div>

        {/* Main Value Proposition */}
        <div className="text-center -mt-8">
          <h2 className="text-3xl font-bold leading-tight">
            Compassionate Care<br />
            for Your Loved Ones
          </h2>
          <p className="mt-3 text-sm opacity-80 max-w-xs mx-auto">
            Trusted, vetted caregivers matched to your family's unique needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md -mt-4">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(107, 159, 219, 0.2)' }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: '#6B9FDB' }}
              >
                <service.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium">{service.label}</span>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="w-full space-y-4">
          {/* WhatsApp CTA */}
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg"
            style={{ backgroundColor: '#25D366' }}
          >
            <Phone className="w-5 h-5" />
            <span className="font-bold text-lg">WhatsApp: +1 (868) 786-5357</span>
          </div>

          {/* QR Code Section */}
          <div className="flex items-center justify-center gap-4 py-3">
            <div className="bg-white p-2 rounded-lg">
              <QRCode url="https://tavara.care" size={80} />
            </div>
            <div className="text-left">
              <p className="font-bold">Scan to find</p>
              <p className="font-bold">a caregiver</p>
              <p className="text-xs opacity-80 mt-1">tavara.care</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#6B9FDB' }}>
            Serving Trinidad & Tobago
          </p>
        </div>
      </div>
    </div>
  );
};
