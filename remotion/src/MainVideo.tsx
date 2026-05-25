import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Scene1Line1 } from "./scenes/Scene1Line1";
import { Scene2Line2 } from "./scenes/Scene2Line2";
import { Scene3Village } from "./scenes/Scene3Village";
import { Scene4List } from "./scenes/Scene4List";
import { Scene5Logo } from "./scenes/Scene5Logo";
import { brand } from "./brand";
import "./fonts";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: brand.creamMid }}>
      <Series>
        <Series.Sequence durationInFrames={44}>
          <Scene1Line1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={44}>
          <Scene2Line2 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={48}>
          <Scene3Village />
        </Series.Sequence>
        <Series.Sequence durationInFrames={64}>
          <Scene4List />
        </Series.Sequence>
        <Series.Sequence durationInFrames={70}>
          <Scene5Logo />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
