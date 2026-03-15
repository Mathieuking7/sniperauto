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

export const EndCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlY = spring({ frame, fps, delay: 20, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.text,
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
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: logoOpacity,
            transform: `scale(${logoSpring})`,
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
              boxShadow: "0 12px 40px rgba(0, 122, 255, 0.4)",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="22" y1="12" x2="18" y2="12" />
              <line x1="6" y1="12" x2="2" y2="12" />
              <line x1="12" y1="6" x2="12" y2="2" />
              <line x1="12" y1="22" x2="12" y2="18" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.white,
              letterSpacing: -2,
            }}
          >
            SniperAuto
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            transform: `translateY(${interpolate(urlY, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: COLORS.accent,
              letterSpacing: 1,
            }}
          >
            sniperauto.fr
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
