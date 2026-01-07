import React from 'react';
import { QRCode } from './QRCode';
import { Phone, Heart, Pill, Car, UtensilsCrossed, PersonStanding, Quote } from 'lucide-react';

interface CaregivingFlyerTemplateProps {
  id?: string;
}

export const CaregivingFlyerTemplate: React.FC<CaregivingFlyerTemplateProps> = ({ 
  id = 'caregiving-flyer' 
}) => {
  const services = [
    { icon: PersonStanding, label: 'Personal Assistance' },
    { icon: Heart, label: 'Companionship & Support' },
    { icon: Pill, label: 'Medication Support' },
    { icon: PersonStanding, label: 'Safe Mobility Help' },
    { icon: UtensilsCrossed, label: 'Healthy Meals' },
    { icon: Car, label: 'Transportation' },
  ];

  return (
    <div 
      id={id}
      className="bg-white"
      style={{ 
        width: '550px', 
        height: '850px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Content Container */}
      <div className="h-full flex flex-col items-center justify-between p-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#6B9FDB' }}>
            Tavara.care
          </h1>
          <p className="text-lg mt-1 italic" style={{ color: '#6B7280' }}>
            It takes a village to care
          </p>
        </div>

        {/* Main Value Proposition - Emotional Headline */}
        <div className="text-center -mt-6">
          <h2 className="text-3xl font-bold leading-tight" style={{ color: '#1a365d' }}>
            Because Someone You Love<br />
            Deserves to Be Safe & Cared For
          </h2>
          <p className="mt-3 text-sm max-w-sm mx-auto leading-relaxed" style={{ color: '#374151' }}>
            Whether you need help today or you're planning ahead — our team is ready to match you with the right caregiver.
          </p>
        </div>

        {/* Services Grid with Header */}
        <div className="w-full max-w-md -mt-2">
          <p className="text-center font-semibold mb-3" style={{ color: '#6B9FDB' }}>
            💙 What We Offer:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(107, 159, 219, 0.15)' }}
              >
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: '#6B9FDB' }}
                >
                  <service.icon className="w-4 h-4" style={{ color: 'white' }} />
                </div>
                <span className="text-xs font-medium leading-tight" style={{ color: '#374151' }}>{service.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="w-full space-y-3">
          {/* CTA Header */}
          <p className="text-center font-semibold text-sm" style={{ color: '#1a365d' }}>
            ✅ Need a caregiver? Chat with us now!
          </p>
          
          {/* WhatsApp CTA */}
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg"
            style={{ backgroundColor: '#25D366', color: 'white' }}
          >
            <Phone className="w-5 h-5" style={{ color: 'white' }} />
            <span className="font-bold text-lg" style={{ color: 'white' }}>WhatsApp: +1 (868) 786-5357</span>
          </div>

          {/* QR Code Section */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="p-2 rounded-lg" style={{ border: '1px solid #e5e7eb' }}>
              <QRCode url="https://tavara.care" size={70} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm" style={{ color: '#1a365d' }}>📲 Scan to view</p>
              <p className="font-bold text-sm" style={{ color: '#1a365d' }}>available caregivers</p>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>tavara.care</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="w-full max-w-sm text-center px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(107, 159, 219, 0.1)' }}>
          <div className="flex justify-center mb-1">
            <Quote className="w-4 h-4" style={{ color: '#6B9FDB' }} />
          </div>
          <p className="text-xs italic leading-relaxed" style={{ color: '#374151' }}>
            "I love working with families through Tavara. I get to do what I was born to do — care."
          </p>
          <p className="text-xs font-semibold mt-1" style={{ color: '#1a365d' }}>
            — Shenelle, Caregiver since 2022
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#6B9FDB' }}>
            🏝️ Proudly serving families across Trinidad & Tobago
          </p>
        </div>
      </div>
    </div>
  );
};
