import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../fonts';
import { COLORS } from '../colors';

const PLATFORMS = [
  { name: 'Auto1.com', logo: staticFile('auto1.png'), color: '#FF6B00' },
  { name: 'Aramis Auto Pro', logo: staticFile('aramis.svg'), color: '#1B3A5C' },
  { name: 'Le Bon Coin', logo: staticFile('leboncoin.png'), color: '#F56B2A' },
  { name: 'Facebook Marketplace', logo: staticFile('facebook.png'), color: '#1877F2' },
  { name: 'La Centrale', logo: staticFile('lacentrale.png'), color: '#E30613' },
  { name: 'ParuVendu', logo: staticFile('paruvendu.png'), color: '#00A651' },
  { name: 'Alcopa', logo: staticFile('alcopa.png'), color: '#003DA5' },
  { name: 'Pro Encheres VO', logo: staticFile('proencheres.png'), color: '#8B5CF6' },
  { name: 'BCA', logo: staticFile('bca.png'), color: '#1B2E6E' },
];

export const PlatformsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);

  const subOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pulseOpacity = interpolate(frame % 30, [0, 15, 30], [0.4, 1, 0.4]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Title */}
      <div
        style={{
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 40,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.text }}>
          9 plateformes surveillées en temps réel
        </div>
        <div
          style={{
            fontSize: 22,
            color: COLORS.textSecondary,
            marginTop: 12,
            opacity: subOpacity,
          }}
        >
          Toutes vos sources, réunies sur WhatsApp avec SniperAuto
        </div>
      </div>

      {/* Platform grid: 3x3 centered */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          justifyContent: 'center',
          maxWidth: 1700,
        }}
      >
        {PLATFORMS.map((platform, i) => {
          const delay = 12 + i * 6;
          const cardSpring = spring({
            frame,
            fps,
            delay,
            config: { damping: 12, stiffness: 80 },
          });
          const cardOpacity = interpolate(
            frame,
            [delay, delay + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const cardScale = interpolate(cardSpring, [0, 1], [0.7, 1]);
          const cardY = interpolate(cardSpring, [0, 1], [40, 0]);

          return (
            <div
              key={i}
              style={{
                width: 540,
                backgroundColor: '#fff',
                borderRadius: 18,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                border: '1.5px solid #f0f0f0',
                opacity: cardOpacity,
                transform: `translateY(${cardY}px) scale(${cardScale})`,
              }}
            >
              {/* Platform logo */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: '1.5px solid #f0f0f0',
                }}
              >
                <Img
                  src={platform.logo}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Platform info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 4,
                  }}
                >
                  {platform.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#34c759',
                      opacity: pulseOpacity,
                      boxShadow: '0 0 8px rgba(52, 199, 89, 0.6)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#34c759',
                    }}
                  >
                    En ligne — Surveillance active
                  </span>
                </div>
              </div>

              {/* Scan indicator */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.blue,
                  backgroundColor: `${COLORS.blue}10`,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${COLORS.blue}30`,
                  whiteSpace: 'nowrap',
                }}
              >
                Scan 24/7
              </div>
            </div>
          );
        })}
      </div>

      {/* "Et bien plus encore" card */}
      {(() => {
        const moreDelay = 12 + PLATFORMS.length * 6;
        const moreSpring = spring({
          frame,
          fps,
          delay: moreDelay,
          config: { damping: 12, stiffness: 80 },
        });
        const moreOpacity = interpolate(
          frame,
          [moreDelay, moreDelay + 10],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const moreScale = interpolate(moreSpring, [0, 1], [0.7, 1]);
        return (
          <div
            style={{
              marginTop: 20,
              opacity: moreOpacity,
              transform: `scale(${moreScale})`,
            }}
          >
            <div
              style={{
                backgroundColor: `${COLORS.blue}08`,
                borderRadius: 18,
                padding: '18px 48px',
                border: `2px dashed ${COLORS.blue}40`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.blue }}>
                + et bien plus encore !
              </span>
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
