import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeProps {
  url: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  url, 
  size = 100, 
  bgColor = '#FFFFFF', 
  fgColor = '#000000' 
}) => {
  return (
    <QRCodeCanvas
      value={url}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      level="M"
      includeMargin={false}
    />
  );
};
