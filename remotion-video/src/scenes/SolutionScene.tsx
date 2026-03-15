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

const MESSAGES = [
  { text: "\ud83d\udea8 Nouveau deal disponible", delay: 20 },
  { text: "Citroen C5 2.0 HDi - 1 582 \u20ac", delay: 40 },
  { text: "82 000 km \u2022 Diesel", delay: 55 },
  { type: "image" as const, delay: 70 },
];

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Phone mockup */}
      <div
        style={{
          width: 520,
          height: 1050,
          borderRadius: 50,
          backgroundColor: "#1a1a1a",
          padding: 12,
          transform: `scale(${interpolate(phoneScale, [0, 1], [0.8, 1])})`,
          opacity: phoneOpacity,
          boxShadow: "0 40px 120px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 40,
            backgroundColor: COLORS.whatsappBg,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* WhatsApp header */}
          <div
            style={{
              backgroundColor: "#075E54",
              padding: "50px 24px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "white" }}>
                SniperAuto
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
                en ligne
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            {MESSAGES.map((msg, i) => {
              const msgSpring = spring({
                frame,
                fps,
                delay: msg.delay,
                config: { damping: 15 },
              });
              const msgOpacity = interpolate(
                frame,
                [msg.delay, msg.delay + 8],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const translateY = interpolate(msgSpring, [0, 1], [30, 0]);

              if ("type" in msg && msg.type === "image") {
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: "flex-start",
                      opacity: msgOpacity,
                      transform: `translateY(${translateY}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 380,
                        height: 220,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, #c4c4c4, #e0e0e0)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: COLORS.whatsappBubbleIn,
                    borderRadius: 16,
                    borderTopLeftRadius: 4,
                    padding: "16px 20px",
                    maxWidth: "85%",
                    opacity: msgOpacity,
                    transform: `translateY(${translateY}px)`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: i === 0 ? 26 : 24,
                      fontWeight: i === 0 ? 600 : 400,
                      color: i === 0 ? COLORS.accent : COLORS.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
