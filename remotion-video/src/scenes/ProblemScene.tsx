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

const CARDS = [
  { name: 'Citroen C5 2.0 HDi', price: '1 582 €', km: '82 000 km', fuel: 'Diesel' },
  { name: 'Peugeot 308 1.6 HDi', price: '2 100 €', km: '124 000 km', fuel: 'Diesel' },
  { name: 'Renault Clio 1.2 TCe', price: '890 €', km: '98 000 km', fuel: 'Essence' },
  { name: 'VW Golf 2.0 TDI', price: '3 120 €', km: '87 000 km', fuel: 'Diesel' },
  { name: 'BMW 320d F30', price: '4 580 €', km: '145 000 km', fuel: 'Diesel' },
  { name: 'Audi A3 1.6 TDI', price: '2 780 €', km: '103 000 km', fuel: 'Diesel' },
  { name: 'Ford Focus 1.5', price: '2 100 €', km: '91 000 km', fuel: 'Diesel' },
  { name: 'Opel Corsa 1.3 CDTi', price: '1 670 €', km: '78 000 km', fuel: 'Diesel' },
  { name: 'Mercedes A180', price: '5 200 €', km: '65 000 km', fuel: 'Essence' },
  { name: 'Toyota Yaris 1.5', price: '3 400 €', km: '42 000 km', fuel: 'Hybride' },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Title at top */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.text,
            lineHeight: 1.3,
          }}
        >
          Des centaines de deals passent chaque jour sur Auto1...
        </div>
      </div>

      {/* Flying cards */}
      {CARDS.map((card, i) => {
        const startDelay = 10 + i * 8;
        const cardSpring = spring({
          frame,
          fps,
          delay: startDelay,
          config: { damping: 18, stiffness: 60 },
        });

        // Cards come from different directions
        const directions = [
          { startX: -500, startY: 300 },
          { startX: 2200, startY: 400 },
          { startX: -400, startY: 600 },
          { startX: 2100, startY: 250 },
          { startX: -600, startY: 500 },
          { startX: 2300, startY: 700 },
          { startX: -300, startY: 350 },
          { startX: 2000, startY: 550 },
          { startX: -500, startY: 650 },
          { startX: 2200, startY: 450 },
        ];
        const dir = directions[i];

        // Target positions: scattered across center area
        const targetPositions = [
          { x: 200, y: 280 },
          { x: 700, y: 350 },
          { x: 1200, y: 300 },
          { x: 350, y: 550 },
          { x: 850, y: 500 },
          { x: 1350, y: 550 },
          { x: 150, y: 750 },
          { x: 650, y: 700 },
          { x: 1100, y: 750 },
          { x: 500, y: 450 },
        ];
        const target = targetPositions[i];

        const x = interpolate(cardSpring, [0, 1], [dir.startX, target.x]);
        const y = interpolate(cardSpring, [0, 1], [dir.startY, target.y]);
        const rotation = interpolate(cardSpring, [0, 1], [i % 2 === 0 ? -15 : 15, (i % 2 === 0 ? -3 : 3)]);
        const scale = interpolate(cardSpring, [0, 1], [0.6, 0.85]);

        // Fade out at end
        const fadeOut = interpolate(frame, [90, 120], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const cardOpacity = interpolate(frame, [startDelay, startDelay + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }) * fadeOut;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              opacity: cardOpacity,
              transform: `rotate(${rotation}deg) scale(${scale})`,
              width: 360,
              backgroundColor: COLORS.white,
              borderRadius: 16,
              padding: '20px 24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              border: `1px solid rgba(0,0,0,0.05)`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>
              {card.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, color: COLORS.textSecondary }}>
                {card.km} · {card.fuel}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.blue }}>
                {card.price}
              </div>
            </div>
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(transparent, ${COLORS.bg})`,
          zIndex: 5,
        }}
      />
    </AbsoluteFill>
  );
};
