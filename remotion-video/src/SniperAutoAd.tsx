import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { HookScene } from './scenes/HookScene';
import { ProblemScene } from './scenes/ProblemScene';
import { IntroScene } from './scenes/IntroScene';
import { HowItWorksScene } from './scenes/HowItWorksScene';
import { WhatsAppScene } from './scenes/WhatsAppScene';
import { PourQuiScene } from './scenes/PourQuiScene';
import { PricingScene } from './scenes/PricingScene';
import { EndCardScene } from './scenes/EndCardScene';

export const SniperAutoAd: React.FC = () => {
  const transitionDuration = 12;

  return (
    <TransitionSeries>
      {/* Scene 1: Hook (90 frames) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <HookScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-right' })}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 2: Problem (120 frames) */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <ProblemScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 3: SniperAuto Intro (90 frames) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <IntroScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-bottom' })}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 4: How It Works (240 frames) — 2 steps */}
      <TransitionSeries.Sequence durationInFrames={240}>
        <HowItWorksScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 5: WhatsApp Demo (150 frames) */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <WhatsAppScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 6: Pour qui (90 frames) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <PourQuiScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 7: Pricing + CTA (120 frames) */}
      <TransitionSeries.Sequence durationInFrames={120}>
        <PricingScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />

      {/* Scene 8: End Card (60 frames) */}
      <TransitionSeries.Sequence durationInFrames={60}>
        <EndCardScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
