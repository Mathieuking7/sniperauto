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

const FEATURES = [
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    title: 'Scan 24h/24',
    subtitle: 'Surveillance continue des nouvelles annonces Auto1',
    color: COLORS.blue,
    delay: 0,
    fromX: -400,
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: 'Alerte instantanée',
    subtitle: 'Notification WhatsApp dès que le deal correspond',
    color: COLORS.green,
    delay: 15,
    fromX: 0,
  },
  {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
      </svg>
    ),
    title: 'Filtrage intelligent',
    subtitle: 'Critères personnalisés : marque, prix, km, carburant',
    color: COLORS.purple,
    delay: 30,
    fromX: 400,
  },
];

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Section title
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          textAlign: 'center',
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.text }}>
          Comment ça marche ?
        </div>
      </div>

      {/* 3 feature cards */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          marginTop: 40,
        }}
      >
        {FEATURES.map((feat, i) => {
          const cardSpring = spring({
            frame,
            fps,
            delay: feat.delay,
            config: { damping: 12, stiffness: 80 },
          });
          const cardOpacity = interpolate(frame, [feat.delay, feat.delay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cardX = interpolate(cardSpring, [0, 1], [feat.fromX, 0]);
          const cardY = interpolate(cardSpring, [0, 1], [80, 0]);

          // Subtitle appears after card
          const subDelay = feat.delay + 20;
          const subOpacity = interpolate(frame, [subDelay, subDelay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const subSpring = spring({ frame, fps, delay: subDelay, config: { damping: 14 } });
          const subY = interpolate(subSpring, [0, 1], [15, 0]);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 380,
                opacity: cardOpacity,
                transform: `translate(${cardX}px, ${cardY}px)`,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  backgroundColor: feat.color,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 12px 40px ${feat.color}40`,
                  marginBottom: 28,
                }}
              >
                {feat.icon}
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.text,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                {feat.title}
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  lineHeight: 1.4,
                  opacity: subOpacity,
                  transform: `translateY(${subY}px)`,
                }}
              >
                {feat.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
