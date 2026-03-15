import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../fonts';
import { COLORS } from '../colors';

export const EndCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo spring
  const logoSpring = spring({ frame, fps, config: { damping: 10 } });
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // URL
  const urlDelay = 15;
  const urlOpacity = interpolate(frame, [urlDelay, urlDelay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const urlSpring = spring({ frame, fps, delay: urlDelay, config: { damping: 14 } });
  const urlY = interpolate(urlSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.dark} 0%, #0a1628 50%, ${COLORS.blueDark} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          opacity: logoOpacity,
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.6, 1])})`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 26,
            background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDark})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 16px 50px rgba(0, 122, 255, 0.4)',
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: COLORS.white,
            letterSpacing: -3,
          }}
        >
          SniperAuto
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          position: 'absolute',
          bottom: 280,
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 500,
            color: COLORS.blue,
            letterSpacing: 2,
          }}
        >
          sniperauto.fr
        </div>
      </div>
    </AbsoluteFill>
  );
};
