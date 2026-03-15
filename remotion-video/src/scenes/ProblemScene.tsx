import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fontFamily } from '../fonts';
import { COLORS } from '../colors';

const CARDS = [
  { name: 'Citroën C5 2.0 HDi Millenium', price: '1 582 €', km: '232 638 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/img11/c7/11c7d4b9cf96451a8f26af7e909ed5c0/pa/max-MN87802_584a6e5db7f993d7ec0234563871c692.jpg' },
  { name: 'Peugeot 208 1.0 VTi Like', price: '3 196 €', km: '34 605 km', fuel: 'Essence', img: 'https://img-pa.auto1.com/img63/ec/63ec189cb50dad2676587503f00a116f/pa/max-SJ12186_4cd1cffe7d072d67732a02157c4c6625.jpg' },
  { name: 'Citroën C8 2.0 HDi Millenium', price: '3 464 €', km: '161 091 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/imgb6/58/b65886f81bb9b3f36b4987e216545bc0/pa/max-VG69945_35835ea6fcdf1969002d2cc65355e23b.jpg' },
  { name: 'Dacia Duster 1.5 dCi Prestige', price: '5 416 €', km: '187 643 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/img10/2c/102cbecb235045b8cbc6dadee85add1b/pa/max-GA81486_a747e55380e6ad226a306ecc98c93d9a.jpg' },
  { name: 'Peugeot Partner 1.6 Blue-HDi', price: '6 044 €', km: '162 555 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/imga5/e6/a5e6b7c80c782f67ff3d9495e92d90bd/pa/max-WM37094_3e965d79d538ae3a0f3af9c8076e0b37.jpg' },
  { name: 'Renault Kadjar 1.6 dCi Intens', price: '6 319 €', km: '218 681 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/imge6/80/e6806fcaec8b4df3249304b0798adf9d/pa/max-RV03632_912dde2459f7eda68a430aaeb305a9fb.jpg' },
  { name: 'Citroën C4 Grand Spacetourer', price: '6 448 €', km: '162 089 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/img15/36/15362a156936a7cf07ea2c5cc911e72b/pa/max-PK17829_e00a0fd2029044b5ebf849f07196f047.jpg' },
  { name: 'Mitsubishi ASX 1.6 Challenge', price: '6 524 €', km: '110 351 km', fuel: 'Essence', img: 'https://img-pa.auto1.com/img6f/9c/6f9cee4e6093c808d1315e229328ce2f/pa/max-SM21552_58150f2db5fdd782350b79a37722f55b.jpg' },
  { name: 'Audi TT 2.0 TFSI Roadster', price: '7 046 €', km: '181 162 km', fuel: 'Essence', img: 'https://img-pa.auto1.com/imgf5/e6/f5e62ae13f69f6276ab839c7142a5cd6/pa/max-FH05112_b6bda7d1b0950517ab44ff85e0791a8d.jpg' },
  { name: 'Mercedes E 200 CDI', price: '8 317 €', km: '394 275 km', fuel: 'Diesel', img: 'https://img-pa.auto1.com/imge2/15/e2158ab5dbcc13c5ba9f2bdd5b280276/pa/max-NN81936_5590948a97c4a70e10fef052f1bca6e1.jpg' },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily, overflow: 'hidden' }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', opacity: titleOpacity, transform: `translateY(${titleY}px)`, zIndex: 10 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.text, lineHeight: 1.3 }}>
          Des centaines de deals passent chaque jour sur Auto1...
        </div>
      </div>

      {/* Flying cards with REAL photos */}
      {CARDS.map((card, i) => {
        const startDelay = 10 + i * 8;
        const cardSpring = spring({ frame, fps, delay: startDelay, config: { damping: 18, stiffness: 60 } });

        const directions = [
          { startX: -500, startY: 300 }, { startX: 2200, startY: 400 },
          { startX: -400, startY: 600 }, { startX: 2100, startY: 250 },
          { startX: -600, startY: 500 }, { startX: 2300, startY: 700 },
          { startX: -300, startY: 350 }, { startX: 2000, startY: 550 },
          { startX: -500, startY: 650 }, { startX: 2200, startY: 450 },
        ];
        const dir = directions[i];
        const targetPositions = [
          { x: 200, y: 260 }, { x: 700, y: 320 }, { x: 1200, y: 280 },
          { x: 350, y: 500 }, { x: 850, y: 460 }, { x: 1350, y: 510 },
          { x: 150, y: 700 }, { x: 650, y: 660 }, { x: 1100, y: 710 },
          { x: 500, y: 420 },
        ];
        const target = targetPositions[i];

        const x = interpolate(cardSpring, [0, 1], [dir.startX, target.x]);
        const y = interpolate(cardSpring, [0, 1], [dir.startY, target.y]);
        const rotation = interpolate(cardSpring, [0, 1], [i % 2 === 0 ? -15 : 15, i % 2 === 0 ? -3 : 3]);
        const scale = interpolate(cardSpring, [0, 1], [0.6, 0.85]);
        const fadeOut = interpolate(frame, [90, 120], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const cardOpacity = interpolate(frame, [startDelay, startDelay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * fadeOut;

        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, opacity: cardOpacity,
            transform: `rotate(${rotation}deg) scale(${scale})`,
            width: 340, backgroundColor: COLORS.white, borderRadius: 14,
            overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)',
          }}>
            {/* Real car photo */}
            <div style={{ width: '100%', height: 120, overflow: 'hidden' }}>
              <Img src={card.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{card.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: COLORS.textSecondary }}>{card.km} · {card.fuel}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.blue }}>{card.price}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(transparent, ${COLORS.bg})`, zIndex: 5 }} />
    </AbsoluteFill>
  );
};
