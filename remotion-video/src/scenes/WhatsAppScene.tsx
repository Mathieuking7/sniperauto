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

const DEALS = [
  { car: 'Citroën C5 2.0 HDi Millenium', price: '1 582 €', km: '232 638 km', fuel: 'Diesel', time: '09:14', img: 'https://img-pa.auto1.com/img11/c7/11c7d4b9cf96451a8f26af7e909ed5c0/pa/max-MN87802_584a6e5db7f993d7ec0234563871c692.jpg' },
  { car: 'Peugeot 208 1.0 VTi Like', price: '3 196 €', km: '34 605 km', fuel: 'Essence', time: '09:15', img: 'https://img-pa.auto1.com/img63/ec/63ec189cb50dad2676587503f00a116f/pa/max-SJ12186_4cd1cffe7d072d67732a02157c4c6625.jpg' },
  { car: 'Dacia Duster 1.5 dCi Prestige', price: '5 416 €', km: '187 643 km', fuel: 'Diesel', time: '09:17', img: 'https://img-pa.auto1.com/img10/2c/102cbecb235045b8cbc6dadee85add1b/pa/max-GA81486_a747e55380e6ad226a306ecc98c93d9a.jpg' },
  { car: 'Renault Kadjar 1.6 dCi Intens', price: '6 319 €', km: '218 681 km', fuel: 'Diesel', time: '09:19', img: 'https://img-pa.auto1.com/imge6/80/e6806fcaec8b4df3249304b0798adf9d/pa/max-RV03632_912dde2459f7eda68a430aaeb305a9fb.jpg' },
  { car: 'Audi TT 2.0 TFSI Roadster', price: '7 046 €', km: '181 162 km', fuel: 'Essence', time: '09:21', img: 'https://img-pa.auto1.com/imgf5/e6/f5e62ae13f69f6276ab839c7142a5cd6/pa/max-FH05112_b6bda7d1b0950517ab44ff85e0791a8d.jpg' },
  { car: 'Peugeot Partner 1.6 Blue-HDi', price: '6 044 €', km: '162 555 km', fuel: 'Diesel', time: '09:22', img: 'https://img-pa.auto1.com/imga5/e6/a5e6b7c80c782f67ff3d9495e92d90bd/pa/max-WM37094_3e965d79d538ae3a0f3af9c8076e0b37.jpg' },
];

const MESSAGE_INTERVAL = 14;
const FIRST_MESSAGE_DELAY = 12;

export const WhatsAppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneSpring = spring({ frame, fps, config: { damping: 14, stiffness: 60 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [500, 0]);
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const labelOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelSpring = spring({ frame, fps, delay: 10, config: { damping: 14 } });
  const labelX = interpolate(labelSpring, [0, 1], [-40, 0]);

  const visibleCount = DEALS.filter((_, i) => frame >= FIRST_MESSAGE_DELAY + i * MESSAGE_INTERVAL).length;
  const messageHeight = 155;
  const chatAreaHeight = 580;
  const totalContentHeight = visibleCount * messageHeight;
  const scrollOffset = Math.max(0, totalContentHeight - chatAreaHeight + 20);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily, overflow: 'hidden' }}>
      {/* Left side text */}
      <div style={{
        position: 'absolute', left: 80, top: '50%', transform: `translateY(-50%)`,
        width: 480, opacity: labelOpacity,
      }}>
        <div style={{ transform: `translateX(${labelX}px)` }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.text, lineHeight: 1.2, marginBottom: 16 }}>
            Vos deals arrivent directement sur WhatsApp
          </div>
          <div style={{ fontSize: 22, color: COLORS.textSecondary, lineHeight: 1.5 }}>
            Les meilleures affaires de 8+ plateformes, filtrées et livrées en temps réel.
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: COLORS.blue }}>{visibleCount}</div>
              <div style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 600 }}>deals reçus</div>
            </div>
            <div style={{ width: 1, backgroundColor: '#e0e0e0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#25D366' }}>24/7</div>
              <div style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 600 }}>surveillance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone mockup */}
      <div style={{
        position: 'absolute', right: 80, top: '50%',
        transform: `translateY(calc(-50% + ${phoneY}px))`, opacity: phoneOpacity,
      }}>
        <div style={{
          width: 500, height: 940, borderRadius: 52,
          backgroundColor: '#1a1a1a', padding: 8,
          boxShadow: '0 40px 100px rgba(0,0,0,0.35)', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 160, height: 32, backgroundColor: '#1a1a1a', borderRadius: '0 0 22px 22px', zIndex: 20,
          }} />

          <div style={{
            width: '100%', height: '100%', borderRadius: 46,
            overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#fff',
          }}>
            {/* Status Bar */}
            <div style={{
              backgroundColor: '#f6f6f6', padding: '12px 24px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44, flexShrink: 0,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>09:41</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="8" width="3" height="4" rx="0.5" fill="#1a1a1a"/><rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#1a1a1a"/><rect x="9" y="2" width="3" height="10" rx="0.5" fill="#1a1a1a"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1a1a1a"/></svg>
                <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0" y="1" width="22" height="10" rx="2" stroke="#1a1a1a" strokeWidth="1" fill="none"/><rect x="23" y="3.5" width="2" height="5" rx="1" fill="#1a1a1a"/><rect x="1.5" y="2.5" width="19" height="7" rx="1" fill="#1a1a1a"/></svg>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div style={{
              backgroundColor: '#f6f6f6', padding: '6px 10px 10px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '0.5px solid #ddd', flexShrink: 0,
            }}>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none"><path d="M10 2L2 10L10 18" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDark})`,
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#1a1a1a' }}>SniperAuto</div>
                <div style={{ fontSize: 12, color: '#8e8e93' }}>en ligne</div>
              </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, backgroundColor: '#e5ddd5', padding: '8px 8px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8, transform: `translateY(-${scrollOffset}px)` }}>
                {DEALS.map((deal, i) => {
                  const delay = FIRST_MESSAGE_DELAY + i * MESSAGE_INTERVAL;
                  const msgSpring = spring({ frame, fps, delay, config: { damping: 12, stiffness: 100 } });
                  const msgOpacity = interpolate(frame, [delay, delay + 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                  const msgX = interpolate(msgSpring, [0, 1], [100, 0]);
                  const msgScale = interpolate(msgSpring, [0, 1], [0.9, 1]);

                  if (frame < delay) return null;

                  return (
                    <div key={i} style={{
                      alignSelf: 'flex-end', backgroundColor: '#dcf8c6',
                      borderRadius: 12, borderTopRightRadius: 4,
                      padding: '8px 10px', maxWidth: '90%', width: '85%',
                      opacity: msgOpacity, transform: `translateX(${msgX}px) scale(${msgScale})`,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.red, marginBottom: 4 }}>🚨 Nouveau deal disponible</div>
                      {/* Real Auto1 car photo */}
                      <div style={{ width: '100%', height: 110, borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
                        <Img src={deal.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>{deal.car}</div>
                      <div style={{ fontSize: 19, fontWeight: 800, color: '#075E54', marginTop: 3 }}>{deal.price}</div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{deal.km} • {deal.fuel}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: '#7d9979' }}>{deal.time}</span>
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5l3 3 6-7" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5l3 3 6-7" stroke="#53bdeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input bar */}
            <div style={{
              backgroundColor: '#f6f6f6', padding: '8px 10px 28px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderTop: '0.5px solid #ddd', flexShrink: 0,
            }}>
              <div style={{ flex: 1, height: 34, borderRadius: 17, backgroundColor: '#fff', border: '0.5px solid #ddd', display: 'flex', alignItems: 'center', paddingLeft: 12, fontSize: 14, color: '#8e8e93' }}>Message</div>
              <div style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.blue, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
