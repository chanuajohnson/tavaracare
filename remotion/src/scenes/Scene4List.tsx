import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { sansFamily } from "../fonts";
import { SceneBackdrop } from "./SceneBackdrop";
import { brand } from "../brand";

const Line: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const opacity = interpolate(f, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 22], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blur = interpolate(f, [0, 18], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        fontFamily: sansFamily,
        fontWeight: 400,
        fontSize: 68,
        lineHeight: 1.25,
        color: brand.ink,
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
        textAlign: "left",
      }}
    >
      {text}
    </div>
  );
};

export const Scene4List: React.FC = () => {
  return (
    <SceneBackdrop>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 130px",
          gap: 38,
          flexDirection: "column",
        }}
      >
        <Line text="A matched care team." delay={0} />
        <Line text="A coordinator who knows" delay={14} />
        <Line text="your loved one." delay={22} />
        <Line text="One plan. One village." delay={36} />
      </AbsoluteFill>
    </SceneBackdrop>
  );
};
