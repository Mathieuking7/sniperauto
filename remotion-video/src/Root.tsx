import { Composition } from "remotion";
import { SniperAutoAd } from "./SniperAutoAd";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SniperAutoAd"
      component={SniperAutoAd}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
