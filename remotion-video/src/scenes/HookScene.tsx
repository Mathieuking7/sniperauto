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

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter animates from 0 to 2765 over first 45 frames
  const counterProgress = interpolate(frame, [0, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Easing: accelerate then decelerate
  const easedProgress = 1 - Math.pow(1 - counterProgress, 3);
  const counterValue = Math.round(easedProgress * 2765);
  const formattedCounter = counterValue.toLocaleString('fr-FR');

  // Counter scale spring
  const counterScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // "deals cette semaine" fades in
  const dealsOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Question text appears after counter finishes
  const questionOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const questionSpring = spring({
    frame,
    fps,
    delay: 50,
    config: { damping: 14 },
  });
  const questionY = interpolate(questionSpring, [0, 1], [40, 0]);

  // Pulsing glow on counter
  const glowPulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [0.3, 0.6, 0.3]
  );

  // Background particles - floating dots
  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = (i * 137.5) % 1920;
    const baseY = (i * 89.3) % 1080;
    const y = baseY + Math.sin((frame + i * 20) * 0.03) * 30;
    const size = 4 + (i % 3) * 2;
    const opacity = interpolate(frame, [0, 20], [0, 0.15 + (i % 3) * 0.05], {
      extrapolateRight: 'clamp',
    });
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: COLORS.blue,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Main counter */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          transform: `scale(${interpolate(counterScale, [0, 1], [0.5, 1])})`,
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            color: COLORS.blue,
            letterSpacing: -6,
            lineHeight: 1,
            textShadow: `0 0 ${glowPulse * 80}px rgba(0, 122, 255, ${glowPulse})`,
          }}
        >
          {formattedCounter}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.text,
            opacity: dealsOpacity,
            letterSpacing: -1,
          }}
        >
          deals cette semaine
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          opacity: questionOpacity,
          transform: `translateY(${questionY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.dark,
            textAlign: 'center',
          }}
        >
          Combien en avez-vous rate ?
        </div>
      </div>
    </AbsoluteFill>
  );
};
