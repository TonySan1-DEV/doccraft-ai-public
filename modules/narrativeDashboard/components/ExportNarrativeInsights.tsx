export const mcpContext = {
  file: 'modules/narrativeDashboard/components/ExportNarrativeInsights.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React, { useState } from 'react';
import {
  type ThemeAlignmentReport,
} from '../../themeAnalysis/initThemeEngine';

const SYSTEM_VERSION = 'DocCraft-AI v3.0';

interface MockNarrativeSync {
  currentSceneId: string;
  characterFocusId: string;
  activePlotFramework: string;
}

interface MockArcData {
  tension: number[];
  empathy: number[];
  scenes: string[];
}

interface MockPlotData {
  framework: string;
  beats: Array<{ id: string; label: string }>;
}

interface MockSuggestion {
  id: string;
  message: string;
  severity: string;
  impact: number;
  action: string;
}

interface MockRevisionHistory {
  sceneId: string;
  timestamp: number;
  summary: string;
  suggestion: string;
  confidence: number;
}

const mockNarrativeSync: MockNarrativeSync = {
  currentSceneId: 'scene1',
  characterFocusId: 'char1',
  activePlotFramework: 'heros_journey',
};

const mockArcData: MockArcData = {
  tension: [10, 30, 60],
  empathy: [20, 40, 50],
  scenes: ['scene1', 'scene2', 'scene3'],
};

const mockPlotData: MockPlotData = {
  framework: 'HerosJourney',
  beats: [{ id: 'call', label: 'Call to Adventure' }],
};

const mockSuggestions: MockSuggestion[] = [
  {
    id: '1',
    message: 'Raise tension in Act II',
    severity: 'Medium',
    impact: 60,
    action: 'Add conflict.',
  },
];

// Mock revision history (replace with real from useNarrativeSync)
const mockRevisionHistory: MockRevisionHistory[] = [
  {
    sceneId: 'scene1',
    timestamp: 1710000000000,
    summary: 'Added urgency',
    suggestion: 'Fix pacing',
    confidence: 0.92,
  },
  {
    sceneId: 'scene2',
    timestamp: 1710001000000,
    summary: 'Improved emotional tone',
    suggestion: 'Balance emotion',
    confidence: 0.88,
  },
];





// Synchronous mock for export (replace with real async for real data)
function getMockStyleAnalysisSync(sceneId: string, _genre: string) {
  // Use static values for demo
  if (sceneId === 'scene1') {
    return {
      alignmentScore: 85,
      driftFlags: ['tone is neutral, expected dark'],
      recommendations: ['Adjust tone toward dark.'],
      profile: {
        tone: 'neutral',
        voice: 'omniscient',
        pacingScore: 0.5,
        emotionDensity: 0.2,
        lexicalComplexity: 0.4,
        sentenceVariance: 4,
        keyDescriptors: ['stormy'],
        toneConfidence: 0.7,
        voiceConfidence: 0.7,
        pacingScoreConfidence: 0.7,
        emotionDensityConfidence: 0.7,
        lexicalComplexityConfidence: 0.7,
        sentenceVarianceConfidence: 0.7,
        keyDescriptorsConfidence: 0.7,
      },
    };
  }
  if (sceneId === 'scene2') {
    return {
      alignmentScore: 95,
      driftFlags: [],
      recommendations: [],
      profile: {
        tone: 'warm',
        voice: 'casual',
        pacingScore: 0.7,
        emotionDensity: 0.5,
        lexicalComplexity: 0.3,
        sentenceVariance: 3,
        keyDescriptors: ['sunlit'],
        toneConfidence: 0.9,
        voiceConfidence: 0.9,
        pacingScoreConfidence: 0.9,
        emotionDensityConfidence: 0.8,
        lexicalComplexityConfidence: 0.8,
        sentenceVarianceConfidence: 0.8,
        keyDescriptorsConfidence: 0.8,
      },
    };
  }
  if (sceneId === 'scene3') {
    return {
      alignmentScore: 70,
      driftFlags: ['pacing too fast', 'emotion density high'],
      recommendations: [
        'Add description or slow scene transitions.',
        'Balance emotional content.',
      ],
      profile: {
        tone: 'tense',
        voice: 'intimate',
        pacingScore: 0.95,
        emotionDensity: 0.7,
        lexicalComplexity: 0.2,
        sentenceVariance: 2,
        keyDescriptors: ['urgent'],
        toneConfidence: 0.9,
        voiceConfidence: 0.9,
        pacingScoreConfidence: 0.9,
        emotionDensityConfidence: 0.9,
        lexicalComplexityConfidence: 0.7,
        sentenceVarianceConfidence: 0.7,
        keyDescriptorsConfidence: 0.7,
      },
    };
  }
  return null;
}

// Mock theme analysis for export (replace with real async for real data)
function getMockThemeReport(): ThemeAlignmentReport {
  return {
    primaryThemes: ['Trust', 'Loyalty'],
    misalignedScenes: [
      {
        sceneId: 'scene1',
        themes: [
          {
            theme: 'paranoia',
            strength: 0.8,
            context:
              'He glanced over his shoulder, certain someone was watching.',
          },
          {
            theme: 'betrayal',
            strength: 0.7,
            context: 'She remembered the broken promise.',
          },
        ],
      },
    ],
    coverageScore: 67,
    suggestions: [
      'Scene scene1: Add cues for Trust or Loyalty.',
      'Scene scene1: No loyalty signals present. Add character reflection on fractured trust.',
    ],
  };
}

function themeReportMarkdown(
  themeReport: ThemeAlignmentReport,
  sceneMeta: Record<string, { title: string }>
) {
  if (!themeReport) return '';
  let md = '## Thematic Analysis\n';
  md += `- **Primary Themes:** ${themeReport.primaryThemes.join(', ')}\n`;
  md += `- **Coverage:** ${themeReport.coverageScore}%\n`;
  if (themeReport.misalignedScenes.length) {
    md += '\n';
    themeReport.misalignedScenes.forEach(scene => {
      const title = sceneMeta[scene.sceneId]?.title || scene.sceneId;
      md += `### Scene ${scene.sceneId} – &quot;${title}&quot;\n`;
      md += `- 🎯 Target Themes: ${themeReport.primaryThemes.join(', ')}\n`;
      md += `- 🧩 Detected: ${scene.themes.map(t => `${t.theme.charAt(0).toUpperCase() + t.theme.slice(1)} (${t.strength})`).join(', ')}\n`;
      // Find suggestions for this scene
      const sceneSuggestions = themeReport.suggestions.filter(s =>
        s.includes(scene.sceneId)
      );
      if (
        scene.themes.every(
          t =>
            !themeReport.primaryThemes
              .map(pt => pt.toLowerCase())
              .includes(t.theme.toLowerCase())
        )
      ) {
        md += `- ⚠️ Mismatch: No ${themeReport.primaryThemes.join(' or ')} signals present\n`;
      }
      if (sceneSuggestions.length) {
        md += `- 🛠 Suggest:\n`;
        sceneSuggestions.forEach(s => {
          md += `  - ${s.replace(/^Scene [^:]+: /, '')}\n`;
        });
      }
      md += '\n';
    });
  } else {
    md += '\nAll scenes align with primary themes.\n';
  }
  return md;
}

function estimateSize(str: string) {
  return `${(new Blob([str]).size / 1024).toFixed(2)} KB`;
}

function getTimestamp() {
  return new Date().toISOString();
}

function sanitize<T>(data: T): T {
  // Remove sensitive fields (mock)
  const clone = JSON.parse(JSON.stringify(data)) as T;
  if (typeof clone === 'object' && clone !== null) {
    delete (clone as Record<string, unknown>).secret;
  }
  return clone;
}

function revisionHistoryMarkdownTable(history: typeof mockRevisionHistory) {
  if (!history.length) return '';
  return [
    '| Scene | Timestamp | Summary | Suggestion | Confidence |',
    '|-------|-----------|---------|------------|------------|',
    ...history.map(
      h =>
        `| ${h.sceneId} | ${new Date(h.timestamp).toLocaleString()} | ${h.summary} | ${h.suggestion} | ${h.confidence}% |`
    ),
  ].join('\n');
}

interface StyleAnalysisReport {
  alignmentScore: number;
  driftFlags: string[];
  recommendations: string[];
  profile: {
    tone: string;
    voice: string;
    pacingScore: number;
    emotionDensity: number;
    lexicalComplexity: number;
    sentenceVariance: number;
    keyDescriptors: string[];
    toneConfidence: number;
    voiceConfidence: number;
    pacingScoreConfidence: number;
    emotionDensityConfidence: number;
    lexicalComplexityConfidence: number;
    sentenceVarianceConfidence: number;
    keyDescriptorsConfidence: number;
  };
}

function styleAnalysisMarkdownTable(
  styleAnalysis: Record<string, StyleAnalysisReport | null>
) {
  if (!styleAnalysis) return '';
  let md = '## Style Analysis\n';
  Object.entries(styleAnalysis).forEach(([sceneId, report]) => {
    if (!report) return;
    md += `\n### Scene: ${sceneId}\n`;
    md += `- **Tone:** ${report.profile.tone}\n`;
    md += `- **Voice:** ${report.profile.voice}\n`;
    md += `- **Pacing Score:** ${(report.profile.pacingScore * 100).toFixed(0)}%\n`;
    if (report.driftFlags.length) {
      md += `- **Drift Flags:**\n`;
      report.driftFlags.forEach((flag: string) => {
        md += `  - ${flag}\n`;
      });
    } else {
      md += `- **Drift Flags:** None\n`;
    }
    if (report.recommendations.length) {
      md += `- **Recommendations:**\n`;
      report.recommendations.forEach((rec: string) => {
        md += `  - ${rec}\n`;
      });
    } else {
      md += `- **Recommendations:** None\n`;
    }
    md += '\n';
  });
  return md;
}

function generateMarkdown(
  includeHistory: boolean,
  includeStyle: boolean,
  includeTheme: boolean
) {
  let md = `# Narrative Analysis Export\n\n- **Exported:** ${getTimestamp()}\n- **System:** ${SYSTEM_VERSION}\n\n## Character Arcs\n- [Mock character arc summary]\n\n## Emotional Arc\n- Tension: ${mockArcData.tension.join(', ')}\n- Empathy: ${mockArcData.empathy.join(', ')}\n\n## Plot Structure\n- Framework: ${mockPlotData.framework}\n- Beats: ${mockPlotData.beats.map(b => b.label).join(', ')}\n\n## Suggestions\n${mockSuggestions.map(s => `- [${s.severity}] ${s.message} (Impact: ${s.impact})`).join('\n')}\n`;
  if (includeHistory && mockRevisionHistory.length) {
    md += `\n## Revision History\n${revisionHistoryMarkdownTable(mockRevisionHistory)}`;
  }
  if (includeStyle) {
    // For each scene, add style analysis
    const styleAnalysis: Record<string, StyleAnalysisReport | null> = {};
    for (const sceneId of mockArcData.scenes) {
      const genre = 'YA'; // or use a mapping
      styleAnalysis[sceneId] = getMockStyleAnalysisSync(sceneId, genre);
    }
    md += '\n' + styleAnalysisMarkdownTable(styleAnalysis);
  }
  if (includeTheme) {
    // Mock scene meta for titles
    const sceneMeta: Record<string, { title: string }> = {
      scene1: { title: 'The Interrogation' },
      scene2: { title: 'The Library' },
      scene3: { title: 'The Chase' },
    };
    md += '\n' + themeReportMarkdown(getMockThemeReport(), sceneMeta);
  }
  return md;
}

function generateJSON(
  includeHistory: boolean,
  includeStyle: boolean,
  includeTheme: boolean
) {
  const styleAnalysis: Record<string, StyleAnalysisReport | null> = {};
  for (const sceneId of mockArcData.scenes) {
    const genre = 'YA'; // or use a mapping
    styleAnalysis[sceneId] = getMockStyleAnalysisSync(sceneId, genre);
  }
  const themeReport = getMockThemeReport();
  return JSON.stringify(
    {
      exported: getTimestamp(),
      system: SYSTEM_VERSION,
      narrativeSync: sanitize(mockNarrativeSync),
      arcData: sanitize(mockArcData),
      plotData: sanitize(mockPlotData),
      suggestions: sanitize(mockSuggestions),
      ...(includeHistory ? { revisionHistory: mockRevisionHistory } : {}),
      ...(includeStyle ? { styleAnalysis } : {}),
      ...(includeTheme ? { themeReport } : {}),
    },
    null,
    2
  );
}

function generatePDF() {
  // Mock PDF export (real implementation would use Puppeteer or jsPDF)
  return new Blob(
    [`PDF Export\nExported: ${getTimestamp()}\nSystem: ${SYSTEM_VERSION}`],
    { type: 'application/pdf' }
  );
}

const ExportNarrativeInsights: React.FC = () => {
  const [exportType, setExportType] = useState<'md' | 'json' | 'pdf'>('md');
  const [filename, setFilename] = useState('narrative-analysis.md');
  const [size, setSize] = useState('0 KB');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeStyle, setIncludeStyle] = useState(true);
  const [includeTheme, setIncludeTheme] = useState(true);

  function handleExport() {
    try {
      let data: string | Blob;
      let name = 'narrative-analysis';
      if (exportType === 'md') {
        data = generateMarkdown(includeHistory, includeStyle, includeTheme);
        name += '.md';
      } else if (exportType === 'json') {
        data = generateJSON(includeHistory, includeStyle, includeTheme);
        name += '.json';
      } else {
        data = generatePDF();
        name += '.pdf';
      }
      setFilename(name);
      setSize(estimateSize(typeof data === 'string' ? data : 'PDF Export'));
      // Download
      const blob =
        typeof data === 'string'
          ? new Blob([data], {
              type: exportType === 'md' ? 'text/markdown' : 'application/json',
            })
          : data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      setToast({ message: `Exported as ${name}`, type: 'success' });
    } catch (_e) {
      setToast({ message: 'Export failed.', type: 'error' });
    }
  }

  return (
    <div
      className="flex items-center gap-3"
      aria-label="Export Narrative Insights"
    >
      <div className="flex gap-1" role="group" aria-label="Export format">
        <button
          className={`px-2 py-1 rounded text-xs ${exportType === 'md' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setExportType('md')}
          aria-pressed={exportType === 'md'}
        >
          .md
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${exportType === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setExportType('json')}
          aria-pressed={exportType === 'json'}
        >
          .json
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${exportType === 'pdf' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setExportType('pdf')}
          aria-pressed={exportType === 'pdf'}
        >
          .pdf
        </button>
      </div>
      <label
        className="flex items-center gap-1 text-xs"
        aria-label="Include revision history"
      >
        <input
          type="checkbox"
          checked={includeHistory}
          onChange={e => setIncludeHistory(e.target.checked)}
          className="accent-blue-600"
        />
        Revision History
      </label>
      <label
        className="flex items-center gap-1 text-xs"
        aria-label="Include style analysis"
      >
        <input
          type="checkbox"
          checked={includeStyle}
          onChange={e => setIncludeStyle(e.target.checked)}
          className="accent-purple-600"
        />
        Style Analysis
      </label>
      <label
        className="flex items-center gap-1 text-xs"
        aria-label="Include theme analysis"
      >
        <input
          type="checkbox"
          checked={includeTheme}
          onChange={e => setIncludeTheme(e.target.checked)}
          className="accent-indigo-600"
        />
        Theme Analysis
      </label>
      <button
        className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold"
        onClick={handleExport}
        aria-label={`Export as ${exportType}`}
      >
        Export
      </button>
      <span className="text-xs text-gray-500 ml-2">
        {filename} ({size})
      </span>
      {toast && (
        <div
          className={`ml-4 px-3 py-1 rounded text-xs font-semibold ${toast.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ExportNarrativeInsights;
