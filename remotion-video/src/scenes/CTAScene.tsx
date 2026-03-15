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

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);

  const priceSpring = spring({ frame, fps, delay: 20, config: { damping: 200 } });
  const priceOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const priceY = interpolate(priceSpring, [0, 1], [30, 0]);

  const buttonSpring = spring({ frame, fps, delay: 35, config: { damping: 12 } });

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
          alignItems: "center",
          gap: 50,
        }}
      >
        {/* CTA button */}
        <div
          style={{
            backgroundColor: COLORS.accent,
            borderRadius: 60,
            padding: "36px 72px",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px) scale(${interpolate(buttonSpring, [0, 1], [0.9, 1])})`,
            boxShadow: "0 16px 50px rgba(0, 122, 255, 0.35)",
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -0.5,
            }}
          >
            Essayez SniperAuto
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            opacity: priceOpacity,
            transform: `translateY(${priceY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            A partir de 29\u20ac/mois
          </div>
          <div
            style={{
              fontSize: 28,
              color: COLORS.textSecondary,
              fontWeight: 400,
            }}
          >
            Sans engagement
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
