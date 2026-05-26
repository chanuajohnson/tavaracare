import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Scene1Line1 } from "./scenes/Scene1Line1";
import { Scene2Line2 } from "./scenes/Scene2Line2";
import { Scene3Village } from "./scenes/Scene3Village";
import { Scene4List } from "./scenes/Scene4List";
import { Scene5Logo } from "./scenes/Scene5Logo";
import { brand } from "./brand";
import "./fonts";
import { defaultScenes, VillageScenes } from "./types";

export const MainVideo: React.FC<{ scenes?: VillageScenes }> = ({ scenes }) => {
  const s = scenes ?? defaultScenes;
  return (
    <AbsoluteFill style={{ backgroundColor: brand.creamMid }}>
      <Series>
        <Series.Sequence durationInFrames={44}>
          <Scene1Line1 text={s.scene1} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={44}>
          <Scene2Line2 text={s.scene2} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={48}>
          <Scene3Village eyebrow={s.scene3.eyebrow} word={s.scene3.word} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={64}>
          <Scene4List bullets={s.scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={70}>
          <Scene5Logo tagline={s.scene5.tagline} footer={s.scene5.footer} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
