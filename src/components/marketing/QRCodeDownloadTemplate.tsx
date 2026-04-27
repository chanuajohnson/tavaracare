import React from 'react';
import { QRCode } from './QRCode';

interface QRCodeDownloadTemplateProps {
  id?: string;
  locationCode: string;
}

export const QRCodeDownloadTemplate: React.FC<QRCodeDownloadTemplateProps> = ({ 
  id = 'qrcode-download',
  locationCode
}) => {
  // Build URL with tracking parameters
  const baseUrl = 'https://tavara.care/urgent-caregivers';
  const params = new URLSearchParams({
    utm_source: 'qrcode',
    utm_content: 'standalone_qr',
    utm_location: locationCode,
  });
  const qrUrl = `${baseUrl}?${params.toString()}`;

  return (
    <div 
      id={id}
      className="bg-white"
      style={{ 
        width: '300px', 
        height: '380px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#6B9FDB' }}>
          Tavara.care
        </h1>
        <p className="text-sm mt-0.5 italic" style={{ color: '#6B7280' }}>
          It takes a village to care
        </p>
      </div>

      {/* QR Code */}
      <div 
        className="p-4 rounded-xl"
        style={{ 
          border: '2px solid #6B9FDB',
          backgroundColor: 'white',
        }}
      >
        <QRCode url={qrUrl} size={160} />
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="font-bold text-base" style={{ color: '#1a365d' }}>
          📲 Scan to find care
        </p>
        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
          tavara.care/urgent-caregivers
        </p>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs" style={{ color: '#6B9FDB' }}>
          🏝️ Trinidad & Tobago
        </p>
      </div>
    </div>
  );
};
