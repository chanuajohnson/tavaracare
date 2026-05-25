import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Line1 } from "./scenes/Scene1Line1";
import { Scene2Line2 } from "./scenes/Scene2Line2";
import { Scene3Village } from "./scenes/Scene3Village";
import { Scene4List } from "./scenes/Scene4List";
import { Scene5Logo } from "./scenes/Scene5Logo";
import "./fonts";

// Subtle warm background that drifts behind everything
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 240], [0, 40]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% ${30 + shift}%, #F5F0E8 0%, #ECE4D6 55%, #1A1A1A 140%)`,
      }}
    />
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A1A" }}>
      <Backdrop />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={55}>
          <Scene1Line1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence durationInFrames={55}>
          <Scene2Line2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={65}>
          <Scene3Village />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={70}>
          <Scene4List />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />
        <TransitionSeries.Sequence durationInFrames={40}>
          <Scene5Logo />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
