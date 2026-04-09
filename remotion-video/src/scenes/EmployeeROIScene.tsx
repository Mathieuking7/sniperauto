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

export const EmployeeROIScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);

  // Left card (employee cost)
  const leftDelay = 15;
  const leftSpring = spring({ frame, fps, delay: leftDelay, config: { damping: 12, stiffness: 80 } });
  const leftOpacity = interpolate(frame, [leftDelay, leftDelay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const leftX = interpolate(leftSpring, [0, 1], [-200, 0]);

  // Right card (SniperAuto)
  const rightDelay = 25;
  const rightSpring = spring({ frame, fps, delay: rightDelay, config: { damping: 12, stiffness: 80 } });
  const rightOpacity = interpolate(frame, [rightDelay, rightDelay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rightX = interpolate(rightSpring, [0, 1], [200, 0]);

  // Arrow/comparison line
  const arrowDelay = 35;
  const arrowOpacity = interpolate(frame, [arrowDelay, arrowDelay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Bottom text
  const bottomDelay = 50;
  const bottomOpacity = interpolate(frame, [bottomDelay, bottomDelay + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bottomSpring = spring({ frame, fps, delay: bottomDelay, config: { damping: 14 } });
  const bottomY = interpolate(bottomSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
          Remplacez un employé
        </div>
        <div style={{ fontSize: 24, color: COLORS.textSecondary, fontWeight: 400 }}>
          Meilleur qu'un employé, 38 fois moins cher
        </div>
      </div>

      {/* Comparison cards */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 1400,
        }}
      >
        {/* Left: Employee cost */}
        <div
          style={{
            opacity: leftOpacity,
            transform: `translateX(${leftX}px)`,
            width: 380,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: '40px 32px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
              border: '2px solid #e5e5e5',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>👤</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 16 }}>
              Embaucher une personne
            </div>

            <div style={{ fontSize: 56, fontWeight: 800, color: COLORS.red, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
              ~3 000 €
            </div>

            <div style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>
              par mois (salaire + charges)
            </div>

            <div style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>• Formation : 1-2 semaines</div>
              <div style={{ marginBottom: 8 }}>• Erreurs humaines inévitables</div>
              <div>• Disponibilité limitée (35h/sem)</div>
            </div>
          </div>
        </div>

        {/* VS Arrow */}
        <div
          style={{
            opacity: arrowOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 800, color: COLORS.textSecondary, opacity: 0.6 }}>
            VS
          </div>
          <div
            style={{
              width: 3,
              height: 60,
              backgroundColor: COLORS.blue,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Right: SniperAuto */}
        <div
          style={{
            opacity: rightOpacity,
            transform: `translateX(${rightX}px)`,
            width: 380,
          }}
        >
          <div
            style={{
              backgroundColor: `${COLORS.blue}08`,
              borderRadius: 24,
              padding: '40px 32px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
              border: `2px solid ${COLORS.blue}40`,
              textAlign: 'center',
              position: 'relative',
              transform: 'scale(1.05)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: COLORS.blue,
                color: 'white',
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              ✨ MEILLEUR CHOIX
            </div>

            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>
              SniperAuto Pro
            </div>

            <div style={{ fontSize: 56, fontWeight: 800, color: COLORS.blue, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
              79 €
            </div>

            <div style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>
              par mois uniquement
            </div>

            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6, fontWeight: 500 }}>
              <div style={{ marginBottom: 8 }}>✓ Activation immédiate (24h)</div>
              <div style={{ marginBottom: 8 }}>✓ Intelligence artificielle 24/7</div>
              <div>✓ 8+ plateformes surveilles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA text */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          opacity: bottomOpacity,
          transform: `translateY(${bottomY}px)`,
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
          Rentabilisé sur le premier deal
        </div>
        <div style={{ fontSize: 20, color: COLORS.textSecondary }}>
          Trouvez une seule voiture à 3 000 € en-dessous du marché et vous avez déjà gagné votre année d'abonnement.
        </div>
      </div>
    </AbsoluteFill>
  );
};
