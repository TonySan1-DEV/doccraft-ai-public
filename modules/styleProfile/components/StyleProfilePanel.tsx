// MCP Context Block
/*
role: frontend-developer,
tier: Pro,
file: "modules/styleProfile/components/StyleProfilePanel.tsx",
allowedActions: ["scaffold", "visualize", "compare"],
theme: "style_dashboard"
*/

import React, { useEffect, useState } from 'react';
import { useNarrativeSync } from '../../shared/state/useNarrativeSyncContext';
import { analyzeNarrativeStyle, compareToTargetStyle } from '../services/styleProfiler';
import { stylePresets } from '../configs/stylePresets';
import type { StyleTargetProfile, NarrativeStyleProfile, StyleAlignmentReport } from '../types/styleTypes';

interface StyleProfilePanelProps {
  sceneId: string;
  target?: StyleTargetProfile;
}

// Mock function to fetch scene text (replace with real API/store)
async function getSceneText(sceneId: string): Promise<string> {
  return `The night was dark and stormy. I felt a chill run down my spine. The city lights flickered in the rain.`;
}

const METRIC_LABELS: Record<keyof NarrativeStyleProfile, string> = {
  tone: 'Tone',
  voice: 'Voice',
  pacingScore: 'Pacing',
  emotionDensity: 'Emotion Density',
  lexicalComplexity: 'Lexical Complexity',
  sentenceVariance: 'Sentence Variance',
  keyDescriptors: 'Descriptors',
  toneConfidence: 'Tone Confidence',
  voiceConfidence: 'Voice Confidence',
  pacingScoreConfidence: 'Pacing Confidence',
  emotionDensityConfidence: 'Emotion Confidence',
  lexicalComplexityConfidence: 'Lexical Confidence',
  sentenceVarianceConfidence: 'Sentence Confidence',
  keyDescriptorsConfidence: 'Descriptors Confidence',
  warning: 'Warning',
};

const StyleProfilePanel: React.FC<StyleProfilePanelProps> = ({ sceneId, target }) => {
  const narrativeSync = useNarrativeSync();
  const [sceneText, setSceneText] = useState('');
  const [profile, setProfile] = useState<NarrativeStyleProfile | null>(null);
  const [report, setReport] = useState<StyleAlignmentReport | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(target?.genre || 'Noir');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch scene text and analyze style
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const text = await getSceneText(sceneId);
        if (cancelled) return;
        setSceneText(text);
        const prof = await analyzeNarrativeStyle(text);
        if (cancelled) return;
        setProfile(prof);
        const tgt = stylePresets[selectedPreset] || target;
        if (tgt) {
          const rep = compareToTargetStyle(prof, tgt);
          setReport(rep);
        } else {
          setReport(null);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to analyze style.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sceneId, target, selectedPreset]);

  // Preset options
  const presetOptions = Object.keys(stylePresets);

  // Prepare metrics for chart (mocked for now)
  const chartMetrics = profile ? [
    { label: 'Pacing', value: profile.pacingScore },
    { label: 'Emotion Density', value: profile.emotionDensity },
    { label: 'Lexical Complexity', value: profile.lexicalComplexity },
    { label: 'Sentence Variance', value: Math.min(1, profile.sentenceVariance / 10) },
  ] : [];

  return (
    <section
      className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 flex flex-col gap-6"
      aria-label="Style Profile Panel"
      tabIndex={-1}
    >
      <header className="flex items-center gap-4 mb-2">
        <h2 className="font-bold text-xl flex-1">Narrative Style Profile</h2>
        <div className="flex gap-2 items-center">
          <label htmlFor="preset-toggle" className="text-xs font-semibold">Preset:</label>
          <select
            id="preset-toggle"
            className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-xs"
            value={selectedPreset}
            onChange={e => setSelectedPreset(e.target.value)}
            aria-label="Select style preset"
          >
            {presetOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </header>
      {loading ? (
        <div className="text-center text-blue-600 dark:text-blue-300">Analyzing style...</div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400" role="alert">{error}</div>
      ) : profile && report ? (
        <>
          {/* Mock Radar/Bar Chart */}
          <div className="w-full flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 flex flex-col items-center" aria-label="Style Metrics Chart">
              <div className="w-64 h-64 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 mb-2">
                {/* Replace with real chart lib */}
                <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">[Radar Chart Placeholder]</div>
              </div>
              <ul className="w-full flex flex-col gap-1" aria-label="Style Metrics List">
                {chartMetrics.map(m => (
                  <li key={m.label} className="flex justify-between text-xs">
                    <span>{m.label}</span>
                    <span className="font-mono">{(m.value * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex flex-col gap-2" aria-label="Style Analysis Results">
              <div className="flex flex-wrap gap-2" aria-label="Drift Flags">
                {report.driftFlags.length ? report.driftFlags.map((flag, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold" role="status">{flag}</span>
                )) : (
                  <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">No drift detected</span>
                )}
              </div>
              <div className="mt-2" aria-label="Recommendations">
                <div className="font-semibold text-xs mb-1">Recommendations:</div>
                <ul className="list-disc list-inside text-xs text-zinc-700 dark:text-zinc-200">
                  {report.recommendations.length ? report.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  )) : <li>No recommendations needed.</li>}
                </ul>
              </div>
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400" aria-label="Alignment Score">
                <span className="font-semibold">Alignment Score:</span> {report.alignmentScore}/100
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-zinc-500 dark:text-zinc-400">No style data to display.</div>
      )}
    </section>
  );
};

export default StyleProfilePanel; 