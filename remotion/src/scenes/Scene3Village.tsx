import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { serifFamily, sansFamily } from "../fonts";
import { SceneBackdrop } from "./SceneBackdrop";
import { brand } from "../brand";

export const Scene3Village: React.FC<{ eyebrow: string; word: string }> = ({ eyebrow, word }) => {
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

  // Scale down the word size if it's long, so it fits the 1080 width
  const wordLen = word.length;
  const wordFontSize = wordLen <= 8 ? 360 : wordLen <= 12 ? 260 : wordLen <= 18 ? 190 : 140;

  return (
    <SceneBackdrop>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "0 80px" }}>
        <div
          style={{
            fontFamily: sansFamily,
            fontSize: 32,
            letterSpacing: "0.32em",
            color: brand.ink,
            textTransform: "uppercase",
            marginBottom: 40,
            opacity: labelOpacity,
            textAlign: "center",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: serifFamily,
            fontSize: wordFontSize,
            lineHeight: 1,
            color: brand.accent,
            opacity,
            filter: `blur(${blur}px)`,
            transform: `scale(${scale}) translateY(${drift}px)`,
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {word}
        </div>
      </AbsoluteFill>
    </SceneBackdrop>
  );
};
