import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const SceneBackdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 80], [0, 12]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% ${34 + shift}%, #F5F0E8 0%, #ECE4D6 60%, #D9CDB8 130%)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
