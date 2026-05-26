import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { sansFamily } from "../fonts";
import { SceneBackdrop } from "./SceneBackdrop";
import { brand } from "../brand";

const Line: React.FC<{ text: string; delay: number; color?: string; italic?: boolean; fontSize: number }> = ({
  text,
  delay,
  color = brand.ink,
  italic = false,
  fontSize,
}) => {
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
        fontSize,
        lineHeight: 1.25,
        color,
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
        textAlign: "left",
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {text}
    </div>
  );
};

export const Scene4List: React.FC<{ bullets: string[] }> = ({ bullets }) => {
  const n = bullets.length;
  // Scale type/gap so 3-5 bullets all fit comfortably in 1920px
  const fontSize = n <= 3 ? 78 : n === 4 ? 68 : 58;
  const gap = n <= 3 ? 46 : n === 4 ? 38 : 30;
  const stagger = Math.max(8, Math.floor(40 / Math.max(n - 1, 1)));

  return (
    <SceneBackdrop>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 130px",
          gap,
          flexDirection: "column",
        }}
      >
        {bullets.map((b, i) => (
          <Line
            key={i}
            text={b}
            delay={i * stagger}
            fontSize={fontSize}
            color={i === n - 1 ? brand.accent : brand.ink}
          />
        ))}
      </AbsoluteFill>
    </SceneBackdrop>
  );
};
