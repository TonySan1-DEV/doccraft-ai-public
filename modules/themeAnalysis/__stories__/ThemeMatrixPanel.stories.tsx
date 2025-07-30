// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/themeAnalysis/__stories__/ThemeMatrixPanel.stories.tsx",
allowedActions: ["document", "visualize", "test"],
theme: "theme_ui"
*/

import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import ThemeMatrixPanel from '../components/ThemeMatrixPanel';
import type { SceneThemeFingerprint, ThemeKeyword } from '../themeTypes';

// Mock data for scenarios
const themes: ThemeKeyword[] = ['loyalty', 'sacrifice', 'betrayal', 'trust'];

const alignedScenes: SceneThemeFingerprint[] = [
  {
    sceneId: 'sceneA',
    themes: [
      { theme: 'loyalty', strength: 0.8, context: 'He stood by his friend.' },
      { theme: 'sacrifice', strength: 0.7, context: 'She gave up her dream.' },
      { theme: 'trust', strength: 0.6, context: 'They confided in each other.' }
    ]
  }
];

const partialDriftScenes: SceneThemeFingerprint[] = [
  {
    sceneId: 'sceneB',
    themes: [
      { theme: 'loyalty', strength: 0.2, context: 'He hesitated to help.' },
      { theme: 'betrayal', strength: 0.6, context: 'She broke her promise.' }
    ]
  }
];

const fullConflictScenes: SceneThemeFingerprint[] = [
  {
    sceneId: 'sceneC',
    themes: [
      { theme: 'betrayal', strength: 0.9, context: 'He turned against his ally.' }]
  }
];

const allScenes = [
  ...alignedScenes,
  ...partialDriftScenes,
  ...fullConflictScenes
];

const meta: Meta<typeof ThemeMatrixPanel> = {
  title: 'ThemeAnalysis/ThemeMatrixPanel',
  component: ThemeMatrixPanel,
  parameters: {
    a11y: { element: '#root' },
    chromatic: { viewports: [320, 768, 1200] },
    docs: { description: { component: 'Visualizes scene-theme alignment, drift, and conflict. Accessible, colorblind-friendly, and MCP-compliant.' } }
  },
  argTypes: {
    themes: {
      control: 'check',
      options: themes,
      description: 'Select which themes to display as columns.'
    },
    driftHighlight: {
      control: 'boolean',
      description: 'Highlight drifted cells.'
    },
    sceneRange: {
      control: { type: 'range', min: 1, max: allScenes.length, step: 1 },
      description: 'Number of scenes to display.'
    }
  }
};
export default meta;
type Story = StoryObj<typeof ThemeMatrixPanel>;

// Helper for interactive controls
const Template = (args: any) => {
  const [selectedThemes, setSelectedThemes] = useState<ThemeKeyword[]>(args.themes);
  const [driftHighlight, setDriftHighlight] = useState(args.driftHighlight);
  const [sceneRange, setSceneRange] = useState(args.sceneRange);
  const scenes = allScenes.slice(0, sceneRange);
  return (
    <div>
      <div className="flex gap-4 mb-2 items-center">
        <label>
          Themes:
          <select multiple value={selectedThemes} onChange={e => {
            const opts = Array.from(e.target.selectedOptions).map(o => o.value);
            setSelectedThemes(opts as ThemeKeyword[]);
          }} className="ml-2 border rounded px-1 py-0.5 text-xs">
            {themes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="ml-4">
          <input type="checkbox" checked={driftHighlight} onChange={e => setDriftHighlight(e.target.checked)} /> Drift Highlight
        </label>
        <label className="ml-4">
          Scene Range:
          <input type="range" min={1} max={allScenes.length} value={sceneRange} onChange={e => setSceneRange(Number(e.target.value))} />
          <span className="ml-1 text-xs">{sceneRange}</span>
        </label>
      </div>
      <ThemeMatrixPanel
        scenes={scenes.map(scene => ({
          ...scene,
          themes: scene.themes.filter(t => selectedThemes.includes(t.theme))
        }))}
        themes={selectedThemes}
      />
      <div className="mt-2 text-xs text-gray-500" aria-live="polite">
        <span role="img" aria-label="Aligned">✅</span> Aligned &nbsp;
        <span role="img" aria-label="Partial Drift">⚠️</span> Partial Drift &nbsp;
        <span role="img" aria-label="Conflict">❌</span> Full Conflict
      </div>
    </div>
  );
};

export const Aligned: Story = {
  args: {
    scenes: alignedScenes,
    themes,
    driftHighlight: true,
    sceneRange: 1
  },
  render: Template,
  parameters: {
    docs: { storyDescription: 'All expected themes present. No drift.' }
  }
};

export const PartialDrift: Story = {
  args: {
    scenes: partialDriftScenes,
    themes,
    driftHighlight: true,
    sceneRange: 1
  },
  render: Template,
  parameters: {
    docs: { storyDescription: '1–2 missing core themes. Drift highlighted.' }
  }
};

export const FullConflict: Story = {
  args: {
    scenes: fullConflictScenes,
    themes,
    driftHighlight: true,
    sceneRange: 1
  },
  render: Template,
  parameters: {
    docs: { storyDescription: 'Opposite/conflicting themes present. Full conflict.' }
  }
};

export const MixedMatrix: Story = {
  args: {
    scenes: allScenes,
    themes,
    driftHighlight: true,
    sceneRange: allScenes.length
  },
  render: Template,
  parameters: {
    docs: { storyDescription: 'Mixed alignment, drift, and conflict across scenes.' }
  }
}; 