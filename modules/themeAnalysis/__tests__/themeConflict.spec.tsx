// MCP Context Block
/*
role: qa-engineer,
tier: Pro,
file: "modules/themeAnalysis/__tests__/themeConflict.spec.ts",
allowedActions: ["test", "assert", "validate"],
theme: "theme_reporting"
*/

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import { exportThematicAuditMarkdown } from '../services/ThematicReportExporter';
import ThemeMatrixPanel from '../components/ThemeMatrixPanel';
import ThemeSummarySidebar from '../../narrativeDashboard/components/ThemeSummarySidebar';

const mockReport = {
  primaryThemes: ['Trust', 'Betrayal'],
  misalignedScenes: [
    {
      sceneId: '03',
      themes: [
        { theme: 'trust', strength: 0.2, context: 'Doubt lingers.' },
        { theme: 'betrayal', strength: 0.8, context: 'Broken promise.' }
      ]
    },
    {
      sceneId: '07',
      themes: [
        { theme: 'betrayal', strength: 0.9, context: 'Secret revealed.' }
      ]
    }
  ],
  conflictedThemes: [
    {
      theme: 'Trust',
      conflictWith: 'Betrayal',
      conflictReason: 'Scene occurs during midpoint where trust should build, but betrayal dominates, disrupting the arc.'
    },
    {
      theme: 'Betrayal',
      conflictWith: 'Trust',
      conflictReason: 'Scene is expected to show betrayal, but trust cues are present, softening the intended impact.'
    }
  ],
  coverageScore: 72,
  suggestions: [
    'Scene 03: Add cues for trust.',
    'Scene 07: Remove trust signals.'
  ]
};
const mockScenes = [
  { sceneId: '03', title: 'The Interrogation' },
  { sceneId: '07', title: 'Fracture' }
];

describe('Theme Conflict Reason Snapshots', () => {
  // 1. 📄 .md Export Snapshot
  it('renders conflictReason in .md export (data-mcp-role="qa")', () => {
    const md = exportThematicAuditMarkdown(mockReport, mockScenes, { genreTarget: 'Coming of Age', themePreset: 'YA' });
    expect(md).toMatchSnapshot();
    // Blockquote format
    expect(md).toMatch(/> \*\*Trust\*\* vs \*\*Betrayal\*\*: Scene occurs during midpoint/);
    // Per-theme breakdown
    expect(md).toMatch(/### 🧭 Theme: Trust/);
    expect(md).toMatch(/🔥 Conflicts:/);
  });

  // 2. 🌐 .html Export Snapshot (simulate with React SSR)
  it('renders conflictReason in .html export with accessibility (data-mcp-role="qa")', async () => {
    // Simulate HTML export: render ThemeMatrixPanel with conflict reasons
    const { container } = render(
      <ThemeMatrixPanel
        scenes={mockReport.misalignedScenes}
        themes={mockReport.primaryThemes}
        conflictedThemes={mockReport.conflictedThemes}
      />
    );
    // Conflict reason appears in tooltip
    fireEvent.focus(screen.getAllByRole('button', { name: /conflict/i })[0]);
    expect(container).toMatchSnapshot();
    // .theme-reason class (simulate for HTML export)
    // (In real HTML export, ensure conflictReason is inside .theme-reason)
    // Accessibility roles
    expect(container.querySelector('[role="tooltip"]')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  // 3. 📊 Dashboard UI Snapshot
  it('shows conflictReason in ThemeMatrixPanel and ThemeSummarySidebar tooltips (data-mcp-role="qa")', () => {
    render(
      <>
        <ThemeMatrixPanel
          scenes={mockReport.misalignedScenes}
          themes={mockReport.primaryThemes}
          conflictedThemes={mockReport.conflictedThemes}
        />
        <ThemeSummarySidebar report={mockReport} />
      </>
    );
    // Hover/focus on conflicted cell
    const conflictCells = screen.getAllByRole('button', { name: /conflict/i });
    fireEvent.mouseOver(conflictCells[0]);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Scene occurs during midpoint where trust should build, but betrayal dominates');
    // Sidebar shows top 3 conflict reasons
    expect(screen.getByText(/Top Conflicts by Theme/)).toBeInTheDocument();
    expect(screen.getByText(/Trust → Betrayal/)).toBeInTheDocument();
    // Keyboard focus triggers tooltip
    fireEvent.focus(conflictCells[0]);
    expect(screen.getByRole('tooltip')).toBeVisible();
  });

  // 🧬 Edge Case Scenarios
  it('handles rare and genre-specific edge cases (data-test-tag="rare-theme-snap")', async () => {
    const edgeReport = {
      primaryThemes: ['Justice', 'Order', 'Hope', 'Identity', 'Authenticity'],
      misalignedScenes: [
        {
          sceneId: '09',
          themes: [
            { theme: 'vengeance', strength: 0.7, context: 'Retaliation.' },
            { theme: 'chaos', strength: 0.6, context: 'Disorder reigns.' }
          ]
        },
        {
          sceneId: '12',
          themes: [
            { theme: 'anger', strength: 0.9, context: 'Fury dominates.' }
          ]
        },
        {
          sceneId: '15',
          themes: [
            { theme: 'order', strength: 0.5, context: 'Rules imposed.' },
            { theme: 'chaos', strength: 0.5, context: 'Disorder.' },
            { theme: 'control', strength: 0.5, context: 'Tight grip.' }
          ]
        },
        {
          sceneId: 'noir1',
          themes: [
            { theme: 'hope', strength: 0.2, context: 'A glimmer.' },
            { theme: 'cynicism', strength: 0.8, context: 'Bleak outlook.' }
          ]
        },
        {
          sceneId: 'ya1',
          themes: [
            { theme: 'identity', strength: 0.3, context: 'Who am I?' },
            { theme: 'conformity', strength: 0.7, context: 'Fit in.' }
          ]
        },
        {
          sceneId: 'lit1',
          themes: [
            { theme: 'authenticity', strength: 0.4, context: 'True self.' },
            { theme: 'pretension', strength: 0.6, context: 'Affectation.' }
          ]
        }
      ],
      conflictedThemes: [
        {
          theme: 'Justice',
          conflictWith: 'Vengeance',
          conflictReason: 'Justice arc is diluted by chaotic retaliation and lack of moral closure.'
        },
        {
          theme: 'Order',
          conflictWith: 'Chaos',
          conflictReason: 'Order and chaos are locked in a loop, undermining narrative stability.'
        },
        {
          theme: 'Hope',
          conflictWith: 'Cynicism',
          conflictReason: 'Noir genre: Hope is overshadowed by cynicism, eroding optimism.'
        },
        {
          theme: 'Identity',
          conflictWith: 'Conformity',
          conflictReason: 'YA: Identity struggles are suppressed by conformity pressures.'
        },
        {
          theme: 'Authenticity',
          conflictWith: 'Pretension',
          conflictReason: 'Literary: Authenticity is masked by pretension, blurring genuine voice.'
        },
        // Fallback case
        {
          theme: 'Emotion',
          conflictWith: 'Anger',
          conflictReason: null
        }
      ],
      coverageScore: 60,
      suggestions: [
        'Scene 09: Add cues for justice.',
        'Scene 12: Reduce anger dominance.',
        'Scene noir1: Balance hope and cynicism.',
        'Scene ya1: Highlight identity over conformity.',
        'Scene lit1: Reveal authenticity beneath pretension.'
      ]
    };
    const edgeScenes = [
      { sceneId: '09', title: 'Retribution' },
      { sceneId: '12', title: 'Inferno' },
      { sceneId: '15', title: 'Balance' },
      { sceneId: 'noir1', title: 'Bleak Alley' },
      { sceneId: 'ya1', title: 'The Mask' },
      { sceneId: 'lit1', title: 'The Mirror' }
    ];
    // .md export
    const md = exportThematicAuditMarkdown(edgeReport, edgeScenes, { genreTarget: 'Noir', themePreset: 'Noir' });
    expect(md).toMatchSnapshot();
    expect(md).toMatch(/Justice arc is diluted by chaotic retaliation/);
    expect(md).toMatch(/Noir genre: Hope is overshadowed by cynicism/);
    expect(md).toMatch(/YA: Identity struggles are suppressed by conformity/);
    expect(md).toMatch(/Literary: Authenticity is masked by pretension/);
    // .html export (simulate with ThemeMatrixPanel)
    const { container } = render(
      <ThemeMatrixPanel
        scenes={edgeReport.misalignedScenes}
        themes={edgeReport.primaryThemes}
        conflictedThemes={edgeReport.conflictedThemes}
        data-test-tag="rare-theme-snap"
      />
    );
    expect(container).toMatchSnapshot();
    // UI dashboard
    render(
      <ThemeSummarySidebar report={edgeReport} data-test-tag="rare-theme-snap" />
    );
    // At least 5 conflict reasons
    expect(screen.getByText(/Justice arc is diluted/)).toBeInTheDocument();
    expect(screen.getByText(/Order and chaos are locked/)).toBeInTheDocument();
    expect(screen.getByText(/Noir genre: Hope is overshadowed/)).toBeInTheDocument();
    expect(screen.getByText(/YA: Identity struggles/)).toBeInTheDocument();
    expect(screen.getByText(/Literary: Authenticity is masked/)).toBeInTheDocument();
    // Fallback for null conflictReason
    expect(screen.getByText(/Emotion → Anger/)).toBeInTheDocument();
    // Should display fallback text for null
    expect(screen.getByText(/No detailed reason available/)).toBeInTheDocument();
    // Accessibility: aria-labels
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    tooltips.forEach(tip => {
      expect(tip).toHaveAttribute('aria-label');
    });
  });
}); 