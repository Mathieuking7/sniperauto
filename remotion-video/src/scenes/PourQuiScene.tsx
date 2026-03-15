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

const PROFESSIONS = [
  { name: 'Mandataire', color: COLORS.blue, icon: '\ud83d\udcbc' },
  { name: 'Agent auto', color: COLORS.green, icon: '\ud83d\ude97' },
  { name: 'Garagiste', color: COLORS.orange, icon: '\ud83d\udd27' },
  { name: 'Négociant', color: COLORS.purple, icon: '\ud83e\udd1d' },
  { name: 'Marchand VO', color: COLORS.red, icon: '\ud83c\udfea' },
  { name: 'Préparateur', color: COLORS.teal, icon: '\u2728' },
];

export const PourQuiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.text }}>
          Pour qui ?
        </div>
      </div>

      {/* Grid of profession cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 30,
          maxWidth: 1200,
          marginTop: 60,
        }}
      >
        {PROFESSIONS.map((prof, i) => {
          const delay = 10 + i * 8;
          const cardSpring = spring({
            frame,
            fps,
            delay,
            config: { damping: 10, stiffness: 80 },
          });
          const cardOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          // Cards fly in from edges
          const fromDirections = [
            { x: -300, y: -200 },
            { x: 300, y: -200 },
            { x: -400, y: 0 },
            { x: 400, y: 0 },
            { x: -300, y: 200 },
            { x: 300, y: 200 },
          ];
          const from = fromDirections[i];
          const x = interpolate(cardSpring, [0, 1], [from.x, 0]);
          const y = interpolate(cardSpring, [0, 1], [from.y, 0]);
          const rotation = interpolate(cardSpring, [0, 1], [i % 2 === 0 ? -12 : 12, 0]);

          return (
            <div
              key={i}
              style={{
                width: 340,
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                opacity: cardOpacity,
                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: prof.color,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 28,
                }}
              >
                {prof.icon}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.text }}>
                {prof.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
