import { Composition } from 'remotion';
import { SniperAutoAd } from './SniperAutoAd';

// Total: 90+120+90+120+240+150+90+120+120+60 = 1200 frames
// Minus 9 transitions * 12 = 108 frames overlap
// Effective: 1200 - 108 = 1092 frames ~ 36.4s at 30fps

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SniperAutoAd"
      component={SniperAutoAd}
      durationInFrames={1200}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
