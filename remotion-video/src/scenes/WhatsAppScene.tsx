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

export const WhatsAppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides up from bottom
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 60 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [800, 0]);
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Messages
  const messages = [
    { type: 'system' as const, text: '\ud83d\udea8 Nouveau deal disponible', delay: 25 },
    { type: 'bubble' as const, title: 'Citroen C5 2.0 HDi Millenium', price: '1 582 \u20ac', info: '82 000 km \u2022 Diesel', delay: 45 },
    { type: 'image' as const, delay: 70 },
    { type: 'bubble' as const, title: '\u2b50 Essai routier OK \u2022 Pas de voyant', delay: 95 },
  ];

  // Left side label
  const labelOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const labelSpring = spring({ frame, fps, delay: 40, config: { damping: 14 } });
  const labelX = interpolate(labelSpring, [0, 1], [-60, 0]);

  // Right side features
  const feat1Opacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const feat1Spring = spring({ frame, fps, delay: 80, config: { damping: 14 } });
  const feat2Opacity = interpolate(frame, [110, 125], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const feat2Spring = spring({ frame, fps, delay: 110, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Left side text */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 300,
          width: 450,
          opacity: labelOpacity,
          transform: `translateX(${labelX}px)`,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.text, lineHeight: 1.3, marginBottom: 20 }}>
          Recevez vos deals directement sur WhatsApp
        </div>
        <div style={{ fontSize: 26, color: COLORS.textSecondary, lineHeight: 1.5 }}>
          Plus besoin de scroller Auto1. Les meilleures offres arrivent a vous.
        </div>
      </div>

      {/* Phone mockup - centered right */}
      <div
        style={{
          position: 'absolute',
          right: 200,
          top: '50%',
          transform: `translateY(calc(-50% + ${phoneY}px))`,
          opacity: phoneOpacity,
        }}
      >
        <div
          style={{
            width: 380,
            height: 760,
            borderRadius: 44,
            backgroundColor: '#1a1a1a',
            padding: 8,
            boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 30,
              backgroundColor: '#1a1a1a',
              borderRadius: '0 0 20px 20px',
              zIndex: 10,
            }}
          />
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 38,
              backgroundColor: COLORS.whatsappBg,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* WhatsApp header */}
            <div
              style={{
                backgroundColor: COLORS.whatsappHeader,
                padding: '40px 16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDark})`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>SniperAuto</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>en ligne</div>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {messages.map((msg, i) => {
                const msgSpring = spring({
                  frame,
                  fps,
                  delay: msg.delay,
                  config: { damping: 12, stiffness: 100 },
                });
                const msgOpacity = interpolate(frame, [msg.delay, msg.delay + 8], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const msgX = interpolate(msgSpring, [0, 1], [60, 0]);
                const msgScale = interpolate(msgSpring, [0, 1], [0.8, 1]);

                if (msg.type === 'system') {
                  return (
                    <div
                      key={i}
                      style={{
                        alignSelf: 'center',
                        backgroundColor: '#E1F3FB',
                        borderRadius: 8,
                        padding: '6px 14px',
                        opacity: msgOpacity,
                        transform: `translateX(${msgX}px) scale(${msgScale})`,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                if (msg.type === 'image') {
                  return (
                    <div
                      key={i}
                      style={{
                        alignSelf: 'flex-start',
                        opacity: msgOpacity,
                        transform: `translateX(${msgX}px) scale(${msgScale})`,
                      }}
                    >
                      <div
                        style={{
                          width: 280,
                          height: 158,
                          borderRadius: 12,
                          background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDark})`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      </div>
                    </div>
                  );
                }

                // Bubble
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: COLORS.whatsappGreen,
                      borderRadius: 12,
                      borderTopLeftRadius: 4,
                      padding: '10px 14px',
                      maxWidth: '90%',
                      opacity: msgOpacity,
                      transform: `translateX(${msgX}px) scale(${msgScale})`,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, lineHeight: 1.4 }}>
                      {msg.title}
                    </div>
                    {'price' in msg && msg.price && (
                      <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.blue, marginTop: 4 }}>
                        {msg.price}
                      </div>
                    )}
                    {'info' in msg && msg.info && (
                      <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
                        {msg.info}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right side mini features */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 160,
          display: 'flex',
          gap: 30,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: '16px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            opacity: feat1Opacity,
            transform: `translateY(${interpolate(feat1Spring, [0, 1], [20, 0])}px)`,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green }} />
          <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.text }}>Temps reel</div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            padding: '16px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            opacity: feat2Opacity,
            transform: `translateY(${interpolate(feat2Spring, [0, 1], [20, 0])}px)`,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.blue }} />
          <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.text }}>24h/24</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
