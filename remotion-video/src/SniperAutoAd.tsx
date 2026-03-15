import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CTAScene } from "./scenes/CTAScene";
import { EndCardScene } from "./scenes/EndCardScene";

export const SniperAutoAd: React.FC = () => {
  const { fps } = useVideoConfig();

  // Timeline in seconds -> frames
  const INTRO_START = 0;
  const INTRO_DURATION = 4 * fps; // 0-4s

  const PROBLEM_START = 4 * fps;
  const PROBLEM_DURATION = 4 * fps; // 4-8s

  const SOLUTION_START = 8 * fps;
  const SOLUTION_DURATION = 6 * fps; // 8-14s

  const FEATURES_START = 14 * fps;
  const FEATURES_DURATION = 6 * fps; // 14-20s

  const CTA_START = 20 * fps;
  const CTA_DURATION = 5 * fps; // 20-25s

  const END_START = 25 * fps;
  const END_DURATION = 5 * fps; // 25-30s

  return (
    <AbsoluteFill>
      <Sequence
        from={INTRO_START}
        durationInFrames={INTRO_DURATION}
        premountFor={fps}
      >
        <IntroScene />
      </Sequence>

      <Sequence
        from={PROBLEM_START}
        durationInFrames={PROBLEM_DURATION}
        premountFor={fps}
      >
        <ProblemScene />
      </Sequence>

      <Sequence
        from={SOLUTION_START}
        durationInFrames={SOLUTION_DURATION}
        premountFor={fps}
      >
        <SolutionScene />
      </Sequence>

      <Sequence
        from={FEATURES_START}
        durationInFrames={FEATURES_DURATION}
        premountFor={fps}
      >
        <FeaturesScene />
      </Sequence>

      <Sequence
        from={CTA_START}
        durationInFrames={CTA_DURATION}
        premountFor={fps}
      >
        <CTAScene />
      </Sequence>

      <Sequence
        from={END_START}
        durationInFrames={END_DURATION}
        premountFor={fps}
      >
        <EndCardScene />
      </Sequence>
    </AbsoluteFill>
  );
};
