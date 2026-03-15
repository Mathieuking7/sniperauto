import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { COLORS } from "../colors";

const FEATURES = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    text: "Scan Auto1 24h/24",
    delay: 0,
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    text: "Alerte WhatsApp instantanee",
    delay: 20,
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
      </svg>
    ),
    text: "Filtrage intelligent par criteres",
    delay: 40,
  },
];

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 50,
          padding: "0 80px",
          width: "100%",
        }}
      >
        {FEATURES.map((feature, i) => {
          const featureSpring = spring({
            frame,
            fps,
            delay: feature.delay,
            config: { damping: 15 },
          });
          const opacity = interpolate(
            frame,
            [feature.delay, feature.delay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const translateX = interpolate(featureSpring, [0, 1], [-80, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                opacity,
                transform: `translateX(${translateX}px)`,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 22,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 8px 30px rgba(0, 122, 255, 0.25)",
                }}
              >
                {feature.icon}
              </div>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 600,
                  color: COLORS.text,
                  lineHeight: 1.3,
                }}
              >
                {feature.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
