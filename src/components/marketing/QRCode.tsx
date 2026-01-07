import React, { useEffect, useRef } from 'react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code placeholder - in production, use a proper QR library
    // For now, create a visual placeholder with the URL encoded
    const moduleCount = 21; // QR Version 1
    const moduleSize = size / moduleCount;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw QR pattern (simplified visual representation)
    ctx.fillStyle = fgColor;

    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      // Outer square
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = bgColor;
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = fgColor;
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    drawFinderPattern(0, 0); // Top-left
    ctx.fillStyle = fgColor;
    drawFinderPattern(14, 0); // Top-right
    ctx.fillStyle = fgColor;
    drawFinderPattern(0, 14); // Bottom-left

    // Draw timing patterns
    ctx.fillStyle = fgColor;
    for (let i = 8; i < 13; i += 2) {
      ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
      ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
    }

    // Draw some random-looking data modules for visual effect
    const seed = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) continue;
        // Skip timing patterns
        if (row === 6 || col === 6) continue;
        
        // Pseudo-random pattern based on URL
        if ((seed + row * col + row + col) % 3 === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

  }, [url, size, bgColor, fgColor]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
