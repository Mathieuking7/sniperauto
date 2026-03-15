import { Composition } from 'remotion';
import { SniperAutoAd } from './SniperAutoAd';

// Total: 90+120+90+240+150+90+120+60 = 960 frames
// Minus 7 transitions * 12 = 84 frames overlap
// Effective: 1020 - 84 = 936 frames ~ 31.2s at 30fps

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SniperAutoAd"
      component={SniperAutoAd}
      durationInFrames={960}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
