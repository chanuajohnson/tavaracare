import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { serifFamily } from "../fonts";
import { SceneBackdrop } from "./SceneBackdrop";
import { brand } from "../brand";

export const Scene1Line1: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18, 45, 55], [0, 1, 1, 0.85], {
    extrapolateRight: "clamp",
  });
  const blur = interpolate(frame, [0, 22], [14, 0], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 30], [30, 0], { extrapolateRight: "clamp" });

  return (
    <SceneBackdrop>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 110px" }}>
        <div
          style={{
            fontFamily: serifFamily,
            fontSize: 110,
            lineHeight: 1.15,
            color: brand.ink,
            textAlign: "center",
            opacity,
            filter: `blur(${blur}px)`,
            transform: `translateY(${y}px)`,
            letterSpacing: "-0.01em",
          }}
        >
          Caring for someone
          <br />
          you love…
        </div>
      </AbsoluteFill>
    </SceneBackdrop>
  );
};
