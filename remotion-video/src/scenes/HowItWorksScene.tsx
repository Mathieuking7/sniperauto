import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { fontFamily } from '../fonts';
import { COLORS } from '../colors';

// ── Step 1: Configure criteria with rejection filters ───────────────────────

const REJECTION_FILTERS = [
  { icon: '🔧', label: 'Voyant moteur', color: '#EF4444' },
  { icon: '💥', label: 'Véhicule accidenté', color: '#EF4444' },
  { icon: '⚠️', label: 'Anomalie essai routier', color: '#F59E0B' },
  { icon: '🔩', label: 'Défaut boîte de vitesse', color: '#EF4444' },
  { icon: '💨', label: 'Fumée échappement', color: '#F59E0B' },
];

const Step1Configure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const badgeSpring = spring({ frame, fps, delay: 5, config: { damping: 12 } });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  const cardSpring = spring({ frame, fps, delay: 10, config: { damping: 14, stiffness: 80 } });
  const cardOpacity = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardY = interpolate(cardSpring, [0, 1], [50, 0]);

  const sliderProgress = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const budgetMax = Math.round(interpolate(sliderProgress, [0, 1], [0, 3000]));

  const kmProgress = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const kmValue = Math.round(interpolate(kmProgress, [0, 1], [0, 150000]));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: COLORS.text }}>Comment ça marche ?</div>
      </div>

      {/* Step badge */}
      <div style={{ position: 'absolute', top: 120, left: 100, transform: `scale(${badgeScale})`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.blue, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 24, fontWeight: 700, color: '#fff', boxShadow: `0 8px 24px ${COLORS.blue}40` }}>1</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.text }}>Configurez vos critères</div>
      </div>

      {/* Two columns */}
      <div style={{ position: 'absolute', top: 200, left: 80, right: 80, display: 'flex', gap: 40, opacity: cardOpacity, transform: `translateY(${cardY}px)` }}>
        {/* Left: Config panel */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: '32px 36px', boxShadow: '0 16px 48px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 8 }}>Budget max</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.blue }}>{budgetMax.toLocaleString('fr-FR')} €</div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: '#e8e8ed', overflow: 'hidden', marginTop: 8 }}>
              <div style={{ height: '100%', width: `${sliderProgress * 100}%`, borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.purple})` }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 8 }}>Kilométrage max</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text }}>{kmValue.toLocaleString('fr-FR')} km</div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 8 }}>Marques</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Citroën', 'Peugeot', 'Renault', 'Dacia'].map((brand, i) => {
                const tagSpring = spring({ frame, fps, delay: 30 + i * 8, config: { damping: 10, stiffness: 120 } });
                return (
                  <div key={i} style={{ backgroundColor: `${COLORS.blue}14`, color: COLORS.blue, fontSize: 16, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${COLORS.blue}40`, transform: `scale(${interpolate(tagSpring, [0, 1], [0, 1])})`, opacity: interpolate(frame, [30 + i * 8, 36 + i * 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                    {brand}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Rejection filters */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>🛡️ Filtres de rejet automatique</div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 }}>L'IA refuse automatiquement les véhicules avec :</div>
          {REJECTION_FILTERS.map((filter, i) => {
            const filterDelay = 40 + i * 10;
            const filterSpring = spring({ frame, fps, delay: filterDelay, config: { damping: 12, stiffness: 100 } });
            const filterX = interpolate(filterSpring, [0, 1], [60, 0]);
            const filterOpacity = interpolate(frame, [filterDelay, filterDelay + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                backgroundColor: '#fff', borderRadius: 16, padding: '16px 20px',
                border: `2px solid ${filter.color}30`, boxShadow: `0 4px 16px ${filter.color}15`,
                transform: `translateX(${filterX}px)`, opacity: filterOpacity,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${filter.color}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 22 }}>{filter.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.text }}>{filter.label}</div>
                <div style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: 16, backgroundColor: filter.color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 18, color: '#fff', fontWeight: 700 }}>✕</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Step 2: AI filtering with real photos from all platforms ──────────────────

interface DealCard {
  name: string;
  approved: boolean;
  reason: string;
  reasonIcon: string;
  price: string;
  km: string;
  img: string;
}

const DEALS: DealCard[] = [
  { name: 'Peugeot 208 1.0 VTi Like', approved: false, reason: 'VOYANT MOTEUR ALLUMÉ', reasonIcon: '🔧', price: '3 196 €', km: '34 605 km', img: 'https://img-pa.auto1.com/img63/ec/63ec189cb50dad2676587503f00a116f/pa/max-SJ12186_4cd1cffe7d072d67732a02157c4c6625.jpg' },
  { name: 'Citroën C5 2.0 HDi Millenium', approved: true, reason: 'Aucun défaut détecté', reasonIcon: '✅', price: '1 582 €', km: '232 638 km', img: 'https://img-pa.auto1.com/img11/c7/11c7d4b9cf96451a8f26af7e909ed5c0/pa/max-MN87802_584a6e5db7f993d7ec0234563871c692.jpg' },
  { name: 'Dacia Duster 1.5 dCi Prestige', approved: false, reason: 'ANOMALIE ESSAI ROUTIER', reasonIcon: '⚠️', price: '5 416 €', km: '187 643 km', img: 'https://img-pa.auto1.com/img10/2c/102cbecb235045b8cbc6dadee85add1b/pa/max-GA81486_a747e55380e6ad226a306ecc98c93d9a.jpg' },
  { name: 'Renault Kadjar 1.6 dCi Intens', approved: true, reason: 'État parfait • RAS', reasonIcon: '✅', price: '6 319 €', km: '218 681 km', img: 'https://img-pa.auto1.com/imge6/80/e6806fcaec8b4df3249304b0798adf9d/pa/max-RV03632_912dde2459f7eda68a430aaeb305a9fb.jpg' },
  { name: 'Mitsubishi ASX 1.6 Challenge', approved: false, reason: 'PRIX > BUDGET MAX', reasonIcon: '💰', price: '6 524 €', km: '110 351 km', img: 'https://img-pa.auto1.com/img6f/9c/6f9cee4e6093c808d1315e229328ce2f/pa/max-SM21552_58150f2db5fdd782350b79a37722f55b.jpg' },
  { name: 'Mercedes E 200 CDI', approved: false, reason: 'DÉFAUT BOÎTE DE VITESSE', reasonIcon: '🔩', price: '8 317 €', km: '394 275 km', img: 'https://img-pa.auto1.com/imge2/15/e2158ab5dbcc13c5ba9f2bdd5b280276/pa/max-NN81936_5590948a97c4a70e10fef052f1bca6e1.jpg' },
  { name: 'Peugeot Partner 1.6 Blue-HDi', approved: true, reason: 'Aucun défaut détecté', reasonIcon: '✅', price: '6 044 €', km: '162 555 km', img: 'https://img-pa.auto1.com/imga5/e6/a5e6b7c80c782f67ff3d9495e92d90bd/pa/max-WM37094_3e965d79d538ae3a0f3af9c8076e0b37.jpg' },
];

const Step2Filter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12 } });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  const cardsOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardsSpring = spring({ frame, fps, delay: 5, config: { damping: 14 } });
  const cardsY = interpolate(cardsSpring, [0, 1], [30, 0]);

  const scanProgress = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scanY = interpolate(scanProgress, [0, 1], [-5, 105]);

  const rejectedCount = DEALS.filter((d, i) => { const sf = 20 + (i / DEALS.length) * 80; return !d.approved && frame > sf + 10; }).length;
  const approvedCount = DEALS.filter((d, i) => { const sf = 20 + (i / DEALS.length) * 80; return d.approved && frame > sf + 10; }).length;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily }}>
      {/* Step badge */}
      <div style={{ position: 'absolute', top: 40, left: 80, transform: `scale(${badgeScale})`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.purple, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 24, fontWeight: 700, color: '#fff', boxShadow: `0 8px 24px ${COLORS.purple}40` }}>2</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.text }}>Tri intelligent par descriptif</div>
      </div>

      {/* Counters */}
      <div style={{ position: 'absolute', top: 48, right: 80, display: 'flex', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', padding: '8px 16px', borderRadius: 12, border: '2px solid #fecaca' }}>
          <span style={{ fontSize: 20 }}>❌</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#EF4444' }}>{rejectedCount}</span>
          <span style={{ fontSize: 14, color: '#EF4444', fontWeight: 600 }}>rejetées</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', padding: '8px 16px', borderRadius: 12, border: '2px solid #bbf7d0' }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{approvedCount}</span>
          <span style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>validées</span>
        </div>
      </div>

      {/* Deal cards */}
      <div style={{
        position: 'absolute', top: 120, left: 60, right: 60, bottom: 40,
        display: 'flex', flexDirection: 'column', gap: 8,
        opacity: cardsOpacity, transform: `translateY(${cardsY}px)`,
      }}>
        {frame >= 20 && frame <= 105 && (
          <div style={{
            position: 'absolute', left: -10, right: -10, top: `${scanY}%`, height: 4, zIndex: 10, borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.purple}, ${COLORS.blue}, ${COLORS.purple}, transparent)`,
            boxShadow: `0 0 24px ${COLORS.purple}80, 0 0 48px ${COLORS.blue}40`,
          }} />
        )}

        {DEALS.map((deal, i) => {
          const cardScanFrame = 20 + (i / DEALS.length) * 80;
          const isScanned = frame > cardScanFrame + 10;
          const isBeingScanned = frame > cardScanFrame && frame <= cardScanFrame + 10;

          let cardX = 0;
          let cardOp = 1;
          if (isScanned && !deal.approved) {
            const slideOut = interpolate(frame, [cardScanFrame + 10, cardScanFrame + 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            cardX = interpolate(slideOut, [0, 1], [0, -1200]);
            cardOp = interpolate(slideOut, [0, 0.8, 1], [1, 0.6, 0]);
          }

          let glowShadow = 'none';
          if (isScanned && deal.approved) glowShadow = `0 0 24px ${COLORS.green}40, 0 4px 16px rgba(0,0,0,0.06)`;

          // Rejected cards show red bg from start; approved show green only after scan
          const bgColor = !deal.approved ? '#fef2f2' : isScanned ? '#f0fdf4' : isBeingScanned ? '#f5f0ff' : '#fff';
          const borderColor = !deal.approved ? `${COLORS.red}50` : isScanned ? `${COLORS.green}60` : isBeingScanned ? `${COLORS.purple}40` : '#e8e8ed';

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              backgroundColor: bgColor, border: `2.5px solid ${borderColor}`, borderRadius: 16,
              padding: '12px 16px', transform: `translateX(${cardX}px)`, opacity: cardOp,
              boxShadow: glowShadow, height: 88,
            }}>
              {/* Real car photo from any platform */}
              <div style={{ width: 100, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <Img src={deal.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>{deal.name}</div>
                <div style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 2 }}>{deal.km} • {deal.price}</div>
              </div>

              {/* Rejection reasons visible from the start, approval only after scan */}
              {(!deal.approved || isScanned) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  backgroundColor: deal.approved ? '#dcfce7' : '#fee2e2',
                  padding: '10px 18px', borderRadius: 12,
                  border: `2px solid ${deal.approved ? '#86efac' : '#fca5a5'}`,
                }}>
                  <span style={{ fontSize: 22 }}>{deal.reasonIcon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: deal.approved ? '#15803d' : '#dc2626', letterSpacing: deal.approved ? 0 : '0.02em' }}>
                    {deal.reason}
                  </span>
                </div>
              )}

              {/* Status icon: rejection shown from start, approval after scan */}
              {(!deal.approved || isScanned) && (
                <div style={{
                  width: 40, height: 40, borderRadius: 20, flexShrink: 0,
                  backgroundColor: deal.approved ? COLORS.green : COLORS.red,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: 20, color: '#fff', fontWeight: 700,
                  boxShadow: `0 4px 12px ${deal.approved ? COLORS.green : COLORS.red}40`,
                }}>
                  {deal.approved ? '✓' : '✕'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Main HowItWorksScene (2 steps) ──────────────────────────────────────────

export const HowItWorksScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={100}>
        <Step1Configure />
      </Sequence>
      <Sequence from={100} durationInFrames={140}>
        <Step2Filter />
      </Sequence>
    </AbsoluteFill>
  );
};
