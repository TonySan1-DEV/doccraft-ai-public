// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/styleProfile/__stories__/StyleProfilePanel.stories.tsx",
allowedActions: ["document", "preview", "mock"],
theme: "storybook"
*/

import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import StyleProfilePanel from '../components/StyleProfilePanel';
import { stylePresets } from '../configs/stylePresets';
import type { NarrativeStyleProfile, StyleTargetProfile } from '../types/styleTypes';

// Mock profiles
const YAProfile: NarrativeStyleProfile = {
  tone: 'warm',
  voice: 'casual',
  pacingScore: 0.7,
  emotionDensity: 0.5,
  lexicalComplexity: 0.3,
  sentenceVariance: 3,
  keyDescriptors: ['friendly', 'upbeat'],
  toneConfidence: 0.9,
  voiceConfidence: 0.9,
  pacingScoreConfidence: 0.9,
  emotionDensityConfidence: 0.8,
  lexicalComplexityConfidence: 0.8,
  sentenceVarianceConfidence: 0.8,
  keyDescriptorsConfidence: 0.8
};

const LiteraryDriftProfile: NarrativeStyleProfile = {
  tone: 'neutral',
  voice: 'omniscient',
  pacingScore: 0.3,
  emotionDensity: 0.3,
  lexicalComplexity: 0.9,
  sentenceVariance: 7,
  keyDescriptors: ['complex', 'reflective'],
  toneConfidence: 0.8,
  voiceConfidence: 0.8,
  pacingScoreConfidence: 0.7,
  emotionDensityConfidence: 0.7,
  lexicalComplexityConfidence: 0.9,
  sentenceVarianceConfidence: 0.8,
  keyDescriptorsConfidence: 0.7
};

const ThrillerOverIntensityProfile: NarrativeStyleProfile = {
  tone: 'tense',
  voice: 'intimate',
  pacingScore: 0.9,
  emotionDensity: 0.7,
  lexicalComplexity: 0.4,
  sentenceVariance: 2,
  keyDescriptors: ['urgent', 'sharp'],
  toneConfidence: 0.9,
  voiceConfidence: 0.9,
  pacingScoreConfidence: 0.9,
  emotionDensityConfidence: 0.9,
  lexicalComplexityConfidence: 0.7,
  sentenceVarianceConfidence: 0.7,
  keyDescriptorsConfidence: 0.7
};

const mockSceneText = 'The night was dark and stormy. I felt a chill run down my spine. The city lights flickered in the rain.';

// Storybook meta
const meta: Meta<typeof StyleProfilePanel> = {
  title: 'StyleProfile/StyleProfilePanel',
  component: StyleProfilePanel,
  parameters: {
    a11y: { element: '#root' },
    docs: {
      description: {
        component: `
**StyleProfilePanel** visualizes narrative style metrics and alignment with genre/audience targets.
- Accessible: All charts and warnings are ARIA-labeled, keyboard navigable.
- Use the genre preset toggle to preview different style targets.
- Storybook-addon-a11y is enabled for accessibility checks.
        `
      }
    }
  },
  argTypes: {
    sceneId: { control: 'text', description: 'Scene ID to analyze' },
    target: { control: 'select', options: Object.keys(stylePresets), description: 'Genre preset target' },
    chartMode: { control: 'radio', options: ['radar', 'bars'], description: 'Chart visualization mode' }
  }
};
export default meta;

type Story = StoryObj<typeof StyleProfilePanel>;

// Helper for live preset toggle
const WithPresetToggle: React.FC<{ profile: NarrativeStyleProfile; defaultPreset: string; chartMode: 'radar' | 'bars' }> = ({ profile, defaultPreset, chartMode }) => {
  const [preset, setPreset] = useState<string>(defaultPreset);
  return (
    <div>
      <div className="mb-2 flex gap-2 items-center">
        <label htmlFor="preset-toggle" className="text-xs font-semibold">Preset:</label>
        <select
          id="preset-toggle"
          className="px-2 py-1 rounded border border-zinc-300 text-xs"
          value={preset}
          onChange={e => setPreset(e.target.value)}
          aria-label="Select style preset"
        >
          {Object.keys(stylePresets).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <StyleProfilePanel
        sceneId="storybook-scene"
        target={stylePresets[preset]}
      />
    </div>
  );
};

export const YAMatch: Story = {
  name: 'YA Style Match (No Drift)',
  render: (args) => <WithPresetToggle profile={YAProfile} defaultPreset="YA" chartMode={args.chartMode || 'radar'} />,
  args: { sceneId: 'storybook-scene', target: 'YA', chartMode: 'radar' },
  parameters: { docs: { storyDescription: 'YA style, high pacing, casual voice. No drift.' } }
};

export const LiteraryDrift: Story = {
  name: 'Literary Drift (Major Drift)',
  render: (args) => <WithPresetToggle profile={LiteraryDriftProfile} defaultPreset="LiteraryFiction" chartMode={args.chartMode || 'bars'} />,
  args: { sceneId: 'storybook-scene', target: 'LiteraryFiction', chartMode: 'bars' },
  parameters: { docs: { storyDescription: 'Literary style, slow pacing, high complexity. Major drift flagged.' } }
};

export const ThrillerOverIntensity: Story = {
  name: 'Thriller Over-Intensity (Soft Recommendations)',
  render: (args) => <WithPresetToggle profile={ThrillerOverIntensityProfile} defaultPreset="Thriller" chartMode={args.chartMode || 'radar'} />,
  args: { sceneId: 'storybook-scene', target: 'Thriller', chartMode: 'radar' },
  parameters: { docs: { storyDescription: 'Thriller style, emotion spike, tonal sharpness. Minor drift and recommendations.' } }
}; 