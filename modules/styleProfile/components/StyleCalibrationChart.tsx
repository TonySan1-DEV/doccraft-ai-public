export const mcpContext = {
  file: 'modules/styleProfile/components/StyleCalibrationChart.tsx',
  role: 'developer',
  allowedActions: ['refactor', 'type-harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import React from 'react';
import type {
  NarrativeStyleProfile,
  StyleTargetProfile,
} from '../types/styleTypes';
import { clamp01, toPercentDisplay } from '../../emotionArc/utils/scaling';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
} from 'recharts';

interface StyleCalibrationChartProps {
  profile: NarrativeStyleProfile;
  target: StyleTargetProfile;
  viewMode: 'radar' | 'bar';
}

const METRICS = [
  { key: 'pacingScore', label: 'Pacing' },
  { key: 'emotionDensity', label: 'Emotion Density' },
  { key: 'lexicalComplexity', label: 'Lexical Complexity' },
  { key: 'sentenceVariance', label: 'Sentence Variance' },
] as const;

type MetricKey = (typeof METRICS)[number]['key'];

function getMetricValue(
  profile: NarrativeStyleProfile,
  key: MetricKey
): number {
  // Normalize sentenceVariance for chart (assume 0-10 reasonable range)
  if (key === 'sentenceVariance') {
    const variance = profile.sentenceVariance ?? 0;
    const normalized = Math.min(1, variance / 10);
    return clamp01(normalized);
  }
  const value = profile[key] as number;
  return clamp01(value ?? 0);
}

function getTargetValue(target: StyleTargetProfile, key: MetricKey): number {
  if (!target) return 0.5;

  if (key === 'pacingScore') {
    const range = target.pacingRange;
    if (!Array.isArray(range) || range.length < 2) return 0.5;
    const avg = (range[0] + range[1]) / 2;
    return clamp01(avg);
  }
  if (key === 'emotionDensity') {
    const range = target.emotionDensityRange;
    if (!Array.isArray(range) || range.length < 2) return 0.5;
    const avg = (range[0] + range[1]) / 2;
    return clamp01(avg);
  }
  // No direct target for lexicalComplexity/sentenceVariance, use 0.5 as neutral
  return 0.5;
}

const StyleCalibrationChart: React.FC<StyleCalibrationChartProps> = ({
  profile,
  target,
  viewMode,
}) => {
  // Guard against invalid inputs
  if (!profile || !target) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col gap-2">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  // Prepare data for chart
  const data = METRICS.map(m => {
    const value = getMetricValue(profile, m.key);
    const targetValue = getTargetValue(target, m.key);
    const drift = Math.abs(value - targetValue) > 0.15; // highlight if >15% off
    return {
      metric: m.label,
      Profile: value,
      Target: targetValue,
      drift,
    };
  });

  // Chart description for ARIA
  const chartDesc = `Style calibration chart comparing narrative profile to target. Metrics: Pacing, Emotion Density, Lexical Complexity, Sentence Variance. Tone: ${profile.tone ?? 'unknown'}, Voice: ${profile.voice ?? 'unknown'}.`;

  return (
    <div
      className="w-full max-w-xl mx-auto flex flex-col gap-2"
      aria-label="Style Calibration Chart"
      aria-describedby="style-chart-desc"
    >
      <div id="style-chart-desc" className="sr-only">
        {chartDesc}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-semibold">Tone:</span>
        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
          {profile.tone ?? 'unknown'}
        </span>
        <span className="text-xs font-semibold ml-4">Voice:</span>
        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
          {profile.voice ?? 'unknown'}
        </span>
      </div>
      {viewMode === 'radar' ? (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 1]} />
            <Radar
              name="Profile"
              dataKey="Profile"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Target"
              dataKey="Target"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
            />
            <Legend />
            {/* Highlight drift points */}
            <LabelList
              dataKey="drift"
              content={({ x, y, value }) =>
                value ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill="#f87171"
                    aria-label="Drift"
                  />
                ) : null
              }
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
          >
            <XAxis type="number" domain={[0, 1]} hide />
            <YAxis type="category" dataKey="metric" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Target" fill="#82ca9d" barSize={16} />
            <Bar dataKey="Profile" fill="#8884d8" barSize={16}>
              <LabelList
                dataKey="Profile"
                position="right"
                formatter={label => {
                  if (typeof label === 'number') return toPercentDisplay(label);
                  return label;
                }}
              />
            </Bar>
            {/* Highlight drift bars */}
            {data.map(
              (d, i) =>
                d.drift && (
                  <ReferenceLine
                    key={i}
                    y={d.metric}
                    stroke="#f87171"
                    strokeDasharray="3 3"
                    label={{
                      value: 'Drift',
                      position: 'insideRight',
                      fill: '#f87171',
                      fontSize: 10,
                    }}
                  />
                )
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StyleCalibrationChart;
