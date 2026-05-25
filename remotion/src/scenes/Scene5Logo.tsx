import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { serifFamily, sansFamily } from "../fonts";
import { SceneBackdrop } from "./SceneBackdrop";
import { brand } from "../brand";

export const Scene5Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 110 } });
  const scale = interpolate(s, [0, 1], [0.94, 1]);
  const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const lineOpacity = interpolate(frame, [12, 26], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [20, 36], [0, 1], { extrapolateRight: "clamp" });
  const footerOpacity = interpolate(frame, [30, 46], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneBackdrop>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: serifFamily,
            fontSize: 150,
            color: brand.ink,
            opacity,
            transform: `scale(${scale})`,
            letterSpacing: "-0.02em",
          }}
        >
          tavara<span style={{ color: brand.ink }}>.care</span>
        </div>
        <div
          style={{
            fontFamily: sansFamily,
            fontWeight: 300,
            fontSize: 36,
            letterSpacing: "0.38em",
            color: brand.ink,
            textTransform: "uppercase",
            marginTop: 30,
            opacity: lineOpacity,
          }}
        >
          Care, coordinated.
        </div>
        <div
          style={{
            fontFamily: serifFamily,
            fontStyle: "italic",
            fontSize: 44,
            color: brand.inkSoft,
            marginTop: 38,
            opacity: taglineOpacity,
            letterSpacing: "-0.005em",
          }}
        >
          It takes a village to care.
        </div>
        <div
          style={{
            fontFamily: sansFamily,
            fontWeight: 400,
            fontSize: 26,
            color: brand.muted,
            marginTop: 60,
            opacity: footerOpacity,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          All coordinated by your care coordinator.
          <br />
          Tavara.
        </div>
      </AbsoluteFill>
    </SceneBackdrop>
  );
};
