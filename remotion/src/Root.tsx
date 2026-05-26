import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { defaultScenes } from "./types";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={270}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ scenes: defaultScenes }}
  />
);
