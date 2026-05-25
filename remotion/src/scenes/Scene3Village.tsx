import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { serifFamily, sansFamily } from "../fonts";
import { SceneBackdrop } from "./SceneBackdrop";
import { brand } from "../brand";

export const Scene3Village: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const scale = interpolate(s, [0, 1], [0.86, 1]);
  const opacity = interpolate(frame, [0, 18, 55, 65], [0, 1, 1, 0.9], {
    extrapolateRight: "clamp",
  });
  const blur = interpolate(frame, [0, 20], [10, 0], { extrapolateRight: "clamp" });
  const drift = interpolate(frame, [0, 65], [0, -14]);
  const labelOpacity = interpolate(frame, [20, 38], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneBackdrop>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: sansFamily,
            fontSize: 32,
            letterSpacing: "0.32em",
            color: brand.ink,
            textTransform: "uppercase",
            marginBottom: 40,
            opacity: labelOpacity,
          }}
        >
          It takes a
        </div>
        <div
          style={{
            fontFamily: serifFamily,
            fontSize: 360,
            lineHeight: 1,
            color: brand.accent,
            opacity,
            filter: `blur(${blur}px)`,
            transform: `scale(${scale}) translateY(${drift}px)`,
            fontStyle: "italic",
            letterSpacing: "-0.02em",
          }}
        >
          village.
        </div>
      </AbsoluteFill>
    </SceneBackdrop>
  );
};
