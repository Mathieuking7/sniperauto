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

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo icon bounces in
  const iconSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80 },
  });
  const iconOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // "SniperAuto" text slides in from right
  const nameSpring = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 14 },
  });
  const nameX = interpolate(nameSpring, [0, 1], [100, 0]);
  const nameOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tagline slides up
  const tagSpring = spring({
    frame,
    fps,
    delay: 25,
    config: { damping: 14 },
  });
  const tagY = interpolate(tagSpring, [0, 1], [30, 0]);
  const tagOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Blue accent line draws
  const lineWidth = spring({
    frame,
    fps,
    delay: 35,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      {/* Logo + name row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Target icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDark})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 20px 60px rgba(0, 122, 255, 0.35)',
            opacity: iconOpacity,
            transform: `scale(${iconSpring}) rotate(${interpolate(iconSpring, [0, 1], [-90, 0])}deg)`,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>

        {/* SniperAuto text */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: -4,
            opacity: nameOpacity,
            transform: `translateX(${nameX}px)`,
          }}
        >
          SniperAuto
        </div>
      </div>

      {/* Tagline + line */}
      <div
        style={{
          position: 'absolute',
          bottom: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: interpolate(lineWidth, [0, 1], [0, 400]),
            height: 3,
            backgroundColor: COLORS.blue,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: COLORS.textSecondary,
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
          }}
        >
          Vos deals auto, livrés sur WhatsApp
        </div>
      </div>
    </AbsoluteFill>
  );
};
