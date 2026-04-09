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

export const PricingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Price scales up with spring
  const priceSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });
  const priceOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const priceScale = interpolate(priceSpring, [0, 1], [0.3, 1]);

  // ROI text types in
  const roiDelay = 25;
  const roiText = '1 seul deal suffit à rentabiliser 10x votre abonnement';
  const charsVisible = interpolate(frame, [roiDelay, roiDelay + 50], [0, roiText.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const roiOpacity = interpolate(frame, [roiDelay, roiDelay + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CTA button
  const ctaDelay = 70;
  const ctaSpring = spring({
    frame,
    fps,
    delay: ctaDelay,
    config: { damping: 10, stiffness: 80 },
  });
  const ctaOpacity = interpolate(frame, [ctaDelay, ctaDelay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.7, 1]);

  // Pulsing glow on CTA
  const glowIntensity = interpolate(
    frame % 30,
    [0, 15, 30],
    [0.3, 0.6, 0.3]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* Price */}
        <div
          style={{
            opacity: priceOpacity,
            transform: `scale(${priceScale})`,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: COLORS.text,
              textAlign: 'center',
              letterSpacing: -3,
            }}
          >
            À partir de{' '}
            <span style={{ color: COLORS.blue }}>79 €/mois</span>
          </div>
        </div>

        {/* ROI text (typing effect) */}
        <div
          style={{
            opacity: roiOpacity,
            maxWidth: 900,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: COLORS.textSecondary,
              lineHeight: 1.4,
            }}
          >
            {roiText.slice(0, Math.round(charsVisible))}
            <span
              style={{
                opacity: interpolate(frame % 20, [0, 10, 20], [1, 0, 1]),
                color: COLORS.blue,
              }}
            >
              |
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.blue,
              borderRadius: 60,
              padding: '28px 64px',
              boxShadow: `0 16px ${40 + glowIntensity * 30}px rgba(0, 122, 255, ${glowIntensity})`,
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: COLORS.white,
              }}
            >
              Essayez SniperAuto
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
